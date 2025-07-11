import { Token, TokenType, Lexer } from '../clients/lexer';
import { LuaParser, ParseError } from '../parsers/lua';
import * as AST from '../types';

export class LuauParser {
  private tokens: Token[] = [];
  private current: number = 0;

  public parse(input: string): AST.Program {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
    this.current = 0;

    const statements: AST.Statement[] = [];
    let safetyCounter = 0; // Prevent infinite loops

    // --- Collect comments and attach to next node ---
    let pendingComments: any[] = [];

    while (!this.isAtEnd()) {
      // Collect comments before the statement
      while (this.check(TokenType.COMMENT)) {
        const commentToken = this.advance();
        pendingComments.push({
          value: commentToken.value.replace(/^--+/, '').trim(),
          type: 'Line'
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
    const definition = this.parseType();

    // Attach pending comments to fields if present
    if (pendingComments && pendingComments.length && definition && definition.type === 'TableType' && definition.fields) {
      for (const field of definition.fields) {
        (field as any).comments = pendingComments;
      }
      pendingComments.length = 0;
    }

    return {
      type: 'TypeAlias',
      name,
      typeParameters,
      definition,
      location: this.getLocation(),
    };
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

  private parseUnionType(): AST.LuauType {
    let type = this.parseIntersectionType();
    
    if (this.match(TokenType.PIPE)) {
      const types = [type];
      
      do {
        types.push(this.parseIntersectionType());
      } while (this.match(TokenType.PIPE));
      
      return {
        type: 'UnionType',
        types,
        location: this.getLocation(),
      };
    }
    
    return type;
  }

  private parseIntersectionType(): AST.LuauType {
    let type = this.parsePrimaryType();
    
    if (this.match(TokenType.AMPERSAND)) {
      const types = [type];
      
      do {
        types.push(this.parsePrimaryType());
      } while (this.match(TokenType.AMPERSAND));
      
      return {
        type: 'IntersectionType',
        types,
        location: this.getLocation(),
      };
    }
    
    return type;
  }

  private parsePrimaryType(): AST.LuauType {
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
          // Use explicit AnyType node
          return { type: 'AnyType', location: this.getLocation() };
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

      // Always check for return type, but do not default to void/any here
      let returnType: AST.LuauType | undefined = undefined;
      if (this.match(TokenType.COLON)) {
        returnType = this.parseType();
      }

      return {
        type: 'FunctionType',
        parameters,
        returnType,
        location: this.getLocation(),
      };
    }
    
    // Table type
    if (this.match(TokenType.LEFT_BRACE)) {
      const fields: AST.TableTypeField[] = [];

      // Special case: {T} (array type)
      if (!this.check(TokenType.RIGHT_BRACE)) {
        // Peek ahead: if next is a type and then }, treat as array
        const startPos = this.current;
        try {
          const valueType = this.parseType();
          if (this.check(TokenType.RIGHT_BRACE)) {
            fields.push({
              type: 'TableTypeField',
              key: 1,
              valueType,
              optional: false,
              location: this.getLocation(),
            });
            this.consume(TokenType.RIGHT_BRACE, "Expected '}' after table type");
            return {
              type: 'TableType',
              fields,
              location: this.getLocation(),
            };
          } else {
            // Not an array type, reset and parse as normal
            this.current = startPos;
          }
        } catch {
          this.current = startPos;
        }
      }

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
            if (keyType === 'string' || keyType === 'number') {
              key = keyType;
            } else {
              key = keyType; // fallback, but generator will treat as property
            }
          } else if (this.check(TokenType.STRING)) {
            key = this.consume(TokenType.STRING, "Expected string key").value.slice(1, -1);
          } else if (this.check(TokenType.NUMBER)) {
            key = Number(this.consume(TokenType.NUMBER, "Expected number key").value);
          } else {
            throw new ParseError("Expected identifier, string, or number as index key", this.peek());
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
          // Safety break for unexpected tokens (e.g. EOF)
          break;
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

        // Optional trailing comma (already handled above)
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
    
    throw new Error(`Unexpected token in type: ${this.peek().value}`);
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