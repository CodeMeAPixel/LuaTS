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
    
    while (!this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) {
        continue;
      }
      
      // Handle Luau-specific statements
      if (this.check(TokenType.TYPE)) {
        statements.push(this.typeAliasDeclaration());
        continue;
      }
      
      // Use base parser for other statements
      const baseParser = new LuaParser();
      baseParser.setTokens(this.tokens, this.current);
      const stmt = baseParser.parseStatement();
      if (stmt) {
        statements.push(stmt);
        this.current = baseParser.getCurrentPosition();
      }
    }

    return {
      type: 'Program',
      body: statements,
      location: this.getLocation(),
    };
  }

  private typeAliasDeclaration(): AST.TypeAlias {
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
      
      while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
        // Skip newlines and commas
        if (this.match(TokenType.COMMA) || this.match(TokenType.NEWLINE)) continue;
        
        let key: string | number;
        let optional = false;
        
        if (this.match(TokenType.LEFT_BRACKET)) {
          // Index signature [key]: type
          if (this.check(TokenType.IDENTIFIER)) {
            key = this.consume(TokenType.IDENTIFIER, "Expected identifier").value;
          } else {
            const stringToken = this.consume(TokenType.STRING, "Expected string key");
            key = stringToken.value.slice(1, -1); // Remove quotes
          }
          this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after table key");
        } else if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.TYPE)) {
          // Property signature key: type or key?: type
          // Allow keywords like 'type' as property names
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
        } else {
          // Safety break - if we encounter an unexpected token, exit the loop
          // This prevents infinite loops
          break;
        }
        
        this.consume(TokenType.COLON, "Expected ':' after table key");
        const valueType = this.parseType();
        
        fields.push({
          type: 'TableTypeField',
          key,
          valueType,
          optional,
          location: this.getLocation(),
        });
        
        // Optional trailing comma
        this.match(TokenType.COMMA);
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