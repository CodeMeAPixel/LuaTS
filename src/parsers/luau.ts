import { Token, TokenType, Lexer } from '../clients/lexer';
import { LuaParser, ParseError } from '../parsers/lua';
import * as AST from '../types';

export class LuauParser {
  private tokens: Token[] = [];
  private current: number = 0;
  private input: string = '';

  constructor(input: string = '') {
    this.input = input;
  }

  public parse(input?: string): any {
    if (input) {
      this.input = input;
    }
    const lexer = new Lexer(this.input);
    this.tokens = lexer.tokenize(this.input);
    this.current = 0;

    const statements: AST.Statement[] = [];
    let safetyCounter = 0; // Prevent infinite loops

    // Collect comments and attach to next node
    let pendingComments: any[] = [];

    while (!this.isAtEnd()) {
      // Collect comments before the statement
      while (this.check(TokenType.COMMENT) || this.check(TokenType.MULTILINE_COMMENT)) {
        const commentToken = this.advance();
        pendingComments.push({
          value: commentToken.value,
          type: commentToken.type === TokenType.MULTILINE_COMMENT ? 'Block' : 'Line'
        });
      }

      if (this.match(TokenType.NEWLINE)) {
        continue;
      }

      // Handle Luau-specific statements
      if (this.check(TokenType.EXPORT)) {
        this.advance();
        if (this.check(TokenType.TYPE)) {
          const node = this.typeAliasDeclaration(pendingComments);
          (node as any).exported = true;
          pendingComments = [];
          statements.push(node);
          continue;
        }
        // TODO: handle export of functions/variables if needed
      }

      // When processing a type alias, make sure to pass the comments
      if (this.check(TokenType.TYPE)) {
        const node = this.typeAliasDeclaration(pendingComments);
        pendingComments = [];
        statements.push(node);
        continue;
      }

      if (this.check(TokenType.CONTINUE)) {
        this.advance();
        statements.push({
          type: 'ContinueStatement',
          location: this.getLocation(),
        } as any);
        continue;
      }

      // Use base parser for other statements
      const baseParser = new LuaParser();
      baseParser.setTokens(this.tokens, this.current);
      const stmt = baseParser.parseStatement();
      if (stmt) {
        if (pendingComments.length && typeof stmt === 'object') {
          (stmt as any).comments = pendingComments;
          pendingComments = [];
        }
        statements.push(stmt);
        this.current = baseParser.getCurrentPosition();
      } else {
        this.advance();
      }
      safetyCounter++;
      if (safetyCounter > 10000) {
        throw new Error('LuauParser safety break: too many iterations (possible infinite loop)');
      }
    }

    return {
      type: 'Program',
      body: statements.filter(
        (stmt) =>
          stmt &&
          typeof stmt === 'object' &&
          typeof stmt.type === 'string'
      ),
      location: this.getLocation(),
    };
  }

  private typeAliasDeclaration(pendingComments?: any[]): AST.TypeAlias {
    this.consume(TokenType.TYPE, "Expected 'type'");
    const name = this.identifier();

    let typeParameters: string[] | undefined = undefined;
    if (this.match(TokenType.LESS_THAN)) {
      typeParameters = [];
      typeParameters.push(this.consume(TokenType.IDENTIFIER, "Expected type parameter").value);

      while (this.match(TokenType.COMMA)) {
        typeParameters.push(this.consume(TokenType.IDENTIFIER, "Expected type parameter").value);
      }

      this.consume(TokenType.GREATER_THAN, "Expected '>' after type parameters");
    }

    this.consume(TokenType.ASSIGN, "Expected '=' after type name");
    
    // Skip newlines before parsing the type definition
    while (this.match(TokenType.NEWLINE)) {
      // Skip newlines
    }
    
    const definition = this.parseType();

    // Create the TypeAlias node with comments
    const typeAlias: AST.TypeAlias = {
      type: 'TypeAlias' as const,
      name,
      typeParameters,
      definition,
      location: this.getLocation(),
    };
    
    // Attach comments to the type alias if they exist
    if (pendingComments && pendingComments.length) {
      (typeAlias as any).comments = pendingComments;
    }

    return typeAlias;
  }

        
  private parseParameter(): AST.Parameter {
    const name = this.identifier();
    let typeAnnotation: AST.TypeAnnotation | undefined = undefined;
    
    if (this.match(TokenType.COLON)) {
      typeAnnotation = {
        type: 'TypeAnnotation',
        typeAnnotation: this.parseType(),
        location: this.getLocation(),
      };
    }

    // Luau: vararg parameter '...'
    if (this.match(TokenType.DOTS)) {
      return {
        type: 'Parameter',
        name: { type: 'Identifier', name: '...', location: this.getLocation() },
        typeAnnotation: undefined,
        location: this.getLocation(),
      };
    }

    return {
      type: 'Parameter',
      name,
      typeAnnotation,
      location: this.getLocation(),
    };
  }

  private parseType(): AST.LuauType {
    return this.parseUnionType();
  }

  private parseUnionType(): any {
    let left = this.parseIntersectionType();
    
    while (this.match(TokenType.PIPE)) {
      // Skip newlines after pipe
      while (this.match(TokenType.NEWLINE)) {
        // Skip newlines
      }
      
      const right = this.parseIntersectionType();
      left = {
        type: 'UnionType',
        types: left.type === 'UnionType' ? [...left.types, right] : [left, right]
      };
    }
    
    return left;
  }

  private parseIntersectionType(): any {
    let left = this.parsePrimaryType();
    
    while (this.match(TokenType.AMPERSAND)) {
      const right = this.parsePrimaryType();
      left = {
        type: 'IntersectionType',
        types: left.type === 'IntersectionType' ? [...left.types, right] : [left, right]
      };
    }
    
    return left;
  }

  private parsePrimaryType(): any {
    // Handle table types (object literals)
    if (this.match(TokenType.LEFT_BRACE)) {
      const properties: any[] = [];
      
      while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
        // Skip newlines and comments within table types
        if (this.match(TokenType.NEWLINE) || this.match(TokenType.COMMENT) || this.match(TokenType.MULTILINE_COMMENT)) {
          continue;
        }
        
        // Handle empty table or end of properties
        if (this.check(TokenType.RIGHT_BRACE)) {
          break;
        }
        
        // Check for array syntax: {Type} -> Type[]
        if (this.check(TokenType.IDENTIFIER)) {
          // Peek ahead to see if next non-whitespace token is }
          let lookahead = 1;
          while (this.current + lookahead < this.tokens.length) {
            const nextToken = this.tokens[this.current + lookahead];
            if (nextToken.type === TokenType.RIGHT_BRACE) {
              // This is {Type} array syntax
              const elementType = this.parseType();
              this.consume(TokenType.RIGHT_BRACE, "Expected '}' after array element type");
              return {
                type: 'ArrayType',
                elementType,
                location: this.getLocation(),
              };
            } else if (nextToken.type === TokenType.COLON || nextToken.type === TokenType.QUESTION) {
              // This is a property, not array syntax
              break;
            } else if (nextToken.type === TokenType.COMMA) {
              // Skip comma and continue checking - this might be object literal in union
              break;
            } else if (nextToken.type !== TokenType.NEWLINE && nextToken.type !== TokenType.COMMENT) {
              break;
            }
            lookahead++;
          }
        }
        
        // Parse property key
        let key: string;
        let optional = false;
        
        if (this.check(TokenType.STRING)) {
          key = this.advance().value.slice(1, -1); // Remove quotes
        } else if (this.check(TokenType.IDENTIFIER)) {
          key = this.advance().value;
          // Check for optional property marker AFTER the identifier
          if (this.check(TokenType.QUESTION)) {
            optional = true;
            this.advance(); // consume the '?'
          }
        } else if (this.check(TokenType.LEFT_BRACKET)) {
          // Index signature: [string]: type
          this.advance(); // consume '['
          const keyType = this.parseType();
          this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after index signature key");
          this.consume(TokenType.COLON, "Expected ':' after index signature");
          const valueType = this.parseType();
          
          properties.push({
            type: 'IndexSignature',
            keyType,
            valueType,
            location: this.getLocation(),
          });
          
          // Skip trailing comma
          if (this.check(TokenType.COMMA)) {
            this.advance();
          }
          continue;
        } else {
          // Skip unexpected tokens gracefully
          this.advance();
          continue;
        }
        
        this.consume(TokenType.COLON, "Expected ':' after property name");
        const valueType = this.parseType();
        
        properties.push({
          type: 'PropertySignature',
          key: { type: 'Identifier', name: key },
          typeAnnotation: valueType,
          optional,
          location: this.getLocation(),
        });
        
        // CRITICAL FIX: Handle comma properly - consume it if present but don't require it
        if (this.check(TokenType.COMMA)) {
          this.advance(); // consume the comma
          // Skip any whitespace after comma
          while (this.match(TokenType.NEWLINE)) {
            // Skip newlines
          }
        } else if (!this.check(TokenType.RIGHT_BRACE)) {
          // If no comma and not at closing brace, there might be an error
          // but continue gracefully instead of throwing
          continue;
        }
      }
      
      this.consume(TokenType.RIGHT_BRACE, "Expected '}' after table type");
      
      return {
        type: 'TableType',
        properties,
        location: this.getLocation(),
      };
    }
    
    // String literals in types
    if (this.match(TokenType.STRING)) {
      const value = this.previous().value;
      return {
        type: 'GenericType',
        name: value, // Keep the quotes for string literal types
        typeParameters: undefined,
        location: this.getLocation(),
      };
    }
    
    // Built-in types
    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.previous().value;
      
      switch (name) {
        case 'string':
          return { type: 'StringType', location: this.getLocation() };
        case 'number':
          return { type: 'NumberType', location: this.getLocation() };
        case 'boolean':
          return { type: 'BooleanType', location: this.getLocation() };
        case 'nil':
          return { type: 'NilType', location: this.getLocation() };
        case 'any':
          return { type: 'AnyType', location: this.getLocation() };
        case 'true':
        case 'false':
          // Handle boolean literal types
          return { type: 'GenericType', name, typeParameters: undefined, location: this.getLocation() };
        default:
          // Generic type or type reference
          let typeParameters: AST.LuauType[] | undefined = undefined;
          if (this.match(TokenType.LESS_THAN)) {
            typeParameters = [];
            typeParameters.push(this.parseType());
            while (this.match(TokenType.COMMA)) {
              typeParameters.push(this.parseType());
            }
            this.consume(TokenType.GREATER_THAN, "Expected '>' after type parameters");
          }
          return {
            type: 'GenericType',
            name,
            typeParameters,
            location: this.getLocation(),
          };
      }
    }
    
    // Handle literal boolean tokens
    if (this.match(TokenType.TRUE) || this.match(TokenType.FALSE)) {
      const value = this.previous().value;
      return {
        type: 'GenericType',
        name: value,
        typeParameters: undefined,
        location: this.getLocation(),
      };
    }
    
    // Function type
    if (this.match(TokenType.LEFT_PAREN)) {
      const parameters: AST.Parameter[] = [];
      if (!this.check(TokenType.RIGHT_PAREN)) {
        parameters.push(this.parseParameter());
        while (this.match(TokenType.COMMA)) {
          parameters.push(this.parseParameter());
        }
      }
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after function parameters");

      // Fix: Allow optional return type for functions in types
      if (this.match(TokenType.MINUS) && this.match(TokenType.GREATER_THAN)) {
        const returnType = this.parseType();
        return {
          type: 'FunctionType',
          parameters,
          returnType,
          location: this.getLocation(),
        };
      } else {
        // If no '->', treat as a parenthesized type, not a function type
        if (parameters.length === 1 && parameters[0].typeAnnotation?.typeAnnotation) {
          // Single type in parens, return the type annotation
          return parameters[0].typeAnnotation.typeAnnotation;
        }
        
        // For function types without a return type, default to 'void'
        return {
          type: 'FunctionType',
          parameters,
          returnType: { type: 'AnyType', location: this.getLocation() }, // Changed VoidType to AnyType
          location: this.getLocation(),
        };
      }
    }
    
    // Table type
    if (this.match(TokenType.LEFT_BRACE)) {
      const fields: AST.TableTypeField[] = [];

      while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
        // Skip newlines and commas
        if (this.match(TokenType.COMMA) || this.match(TokenType.NEWLINE)) continue;

        let key: string | number;
        let optional = false;

        // Index signature: {[string]: number}
        if (this.match(TokenType.LEFT_BRACKET)) {
          // Accept string or number as key type
          if (this.check(TokenType.IDENTIFIER)) {
            const keyType = this.consume(TokenType.IDENTIFIER, "Expected identifier").value;
            key = keyType;
          } else if (this.check(TokenType.STRING)) {
            key = this.consume(TokenType.STRING, "Expected string key").value.slice(1, -1);
          } else if (this.check(TokenType.NUMBER)) {
            key = Number(this.consume(TokenType.NUMBER, "Expected number key").value);
          } else {
            // Skip unexpected tokens
            this.advance();
            continue;
          }
          this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after table key");
        }
        // Named property: foo: type or foo?: type
        else if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.TYPE)) {
          let keyToken;
          if (this.check(TokenType.IDENTIFIER)) {
            keyToken = this.consume(TokenType.IDENTIFIER, "Expected property name");
          } else {
            keyToken = this.consume(TokenType.TYPE, "Expected property name");
          }
          key = keyToken.value;
          if (this.match(TokenType.QUESTION)) {
            optional = true;
          }
        }
        // Empty table type or trailing comma
        else if (this.check(TokenType.RIGHT_BRACE)) {
          break;
        }
        else {
          // Skip unexpected tokens gracefully instead of throwing
          this.advance();
          continue;
        }

        // Only parse value if we actually got a key
        if (typeof key !== 'undefined') {
          this.consume(TokenType.COLON, "Expected ':' after table key");
          const valueType = this.parseType();

          fields.push({
            type: 'TableTypeField',
            key,
            valueType,
            optional,
            location: this.getLocation(),
          });
        }
      }

      this.consume(TokenType.RIGHT_BRACE, "Expected '}' after table type");

      return {
        type: 'TableType',
        fields,
        location: this.getLocation(),
      };
    }
    
    // Parenthesized type
    if (this.match(TokenType.LEFT_PAREN)) {
      const type = this.parseType();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after type");
      return type;
    }
    
    // Handle errors more gracefully for the parser
    try {
      // Parenthesized type
      if (this.match(TokenType.LEFT_PAREN)) {
        const type = this.parseType();
        this.consume(TokenType.RIGHT_PAREN, "Expected ')' after type");
        return type;
      }
    } catch (error) {
      // Log error but return a fallback type
      console.error(`Error parsing type: ${error}`);
      return { type: 'AnyType', location: this.getLocation() };
    }
    
    // Default for unparseable types
    if (this.isAtEnd() || !this.peek().value) {
      return { type: 'AnyType', location: this.getLocation() };
    }
    
    try {
      // Try to parse as a basic type or return any/unknown
      const token = this.peek();
      console.log(`Handling unparseable type token: ${token.type} - "${token.value}"`);
      return { type: 'AnyType', location: this.getLocation() };
    } catch (e) {
      console.error(`Error parsing type: ${e}`);
      return { type: 'AnyType', location: this.getLocation() };
    }
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParseError(message, this.peek());
  }

  private getLocation(): AST.SourceLocation {
    const token = this.previous();
    return {
      start: { line: token.line, column: token.column },
      end: { line: token.line, column: token.column + token.value.length },
    };
  }

  private identifier(): AST.Identifier {
    this.consume(TokenType.IDENTIFIER, "Expected identifier");
    return {
      type: 'Identifier',
      name: this.previous().value,
      location: this.getLocation(),
    };
  }
}