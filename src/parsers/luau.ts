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
    let safetyCounter = 0;
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
        (stmt) => stmt && typeof stmt === 'object' && typeof stmt.type === 'string'
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
    
    while (this.match(TokenType.NEWLINE)) {
      // Skip newlines
    }
    
    const definition = this.parseType();

    const typeAlias: AST.TypeAlias = {
      type: 'TypeAlias' as const,
      name,
      typeParameters,
      definition,
      location: this.getLocation(),
    };
    
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
    if (this.match(TokenType.LEFT_PAREN)) {
      if (this.isFunctionType()) {
        return this.parseFunctionType();
      } else {
        const type = this.parseType();
        this.consume(TokenType.RIGHT_PAREN, "Expected ')' after type");
        return type;
      }
    }
    
    if (this.match(TokenType.LEFT_BRACE)) {
      return this.parseRecordType();
    }
    
    if (this.match(TokenType.STRING)) {
      const value = this.previous().value;
      return {
        type: 'GenericType',
        name: value,
        typeParameters: undefined,
        location: this.getLocation(),
      };
    }
    
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
          return { type: 'GenericType', name, typeParameters: undefined, location: this.getLocation() };
        default:
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
    
    if (this.match(TokenType.TRUE) || this.match(TokenType.FALSE)) {
      const value = this.previous().value;
      return {
        type: 'GenericType',
        name: value,
        typeParameters: undefined,
        location: this.getLocation(),
      };
    }
    
    return { type: 'AnyType', location: this.getLocation() };
  }

  private parseRecordType(): any {
    const properties: any[] = [];
    
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE) || this.match(TokenType.COMMENT) || this.match(TokenType.MULTILINE_COMMENT)) {
        continue;
      }
      
      if (this.check(TokenType.RIGHT_BRACE)) break;
      
      // Only check for array syntax at the beginning to prevent conflicts
      if (properties.length === 0 && this.checkArraySyntax()) {
        const elementType = this.parseType();
        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after array element type");
        return {
          type: 'ArrayType',
          elementType,
          location: this.getLocation(),
        };
      }
      
      let key: string;
      let optional = false;
      
      // Allow reserved keywords as property names
      if (this.check(TokenType.STRING)) {
        const stringToken = this.advance();
        key = stringToken.value;
      } else if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.TYPE) || this.check(TokenType.EXPORT) || this.check(TokenType.FUNCTION) || this.check(TokenType.LOCAL)) {
        const token = this.advance();
        key = token.value;
        if (this.check(TokenType.QUESTION)) {
          optional = true;
          this.advance();
        }
      } else if (this.check(TokenType.LEFT_BRACKET)) {
        this.advance();
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
        
        if (this.check(TokenType.COMMA)) {
          this.advance();
        }
        continue;
      } else {
        this.advance();
        continue;
      }
      
      if (!this.check(TokenType.COLON)) {
        continue;
      }
      
      this.advance();
      const valueType = this.parseType();
      
      properties.push({
        type: 'PropertySignature',
        key: { type: 'Identifier', name: key },
        typeAnnotation: valueType,
        optional,
        location: this.getLocation(),
      });
      
      if (this.check(TokenType.COMMA)) {
        this.advance();
        while (this.match(TokenType.NEWLINE)) {}
      } else if (!this.check(TokenType.RIGHT_BRACE)) {
        while (this.match(TokenType.NEWLINE)) {}
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after table type");
    
    return {
      type: 'TableType',
      properties,
      location: this.getLocation(),
    };
  }

  private checkArraySyntax(): boolean {
    if (!this.check(TokenType.IDENTIFIER)) return false;
    
    let lookahead = 1;
    while (this.current + lookahead < this.tokens.length) {
      const token = this.tokens[this.current + lookahead];
      
      if (token.type === TokenType.NEWLINE || token.type === TokenType.COMMENT) {
        lookahead++;
        continue;
      } else if (token.type === TokenType.RIGHT_BRACE) {
        return true;
      } else {
        return false;
      }
    }
    
    return false;
  }

  private isFunctionType(): boolean {
    let lookahead = 0;
    
    while (this.current + lookahead < this.tokens.length) {
      const token = this.tokens[this.current + lookahead];
      
      if (token.type === TokenType.RIGHT_PAREN) {
        lookahead++;
        if (this.current + lookahead < this.tokens.length) {
          const next = this.tokens[this.current + lookahead];
          return next.type === TokenType.MINUS;
        }
        return false;
      }
      
      if (token.type === TokenType.IDENTIFIER) {
        lookahead++;
        if (this.current + lookahead < this.tokens.length) {
          const next = this.tokens[this.current + lookahead];
          if (next.type === TokenType.COLON) {
            return true;
          }
          if (next.type === TokenType.COMMA || next.type === TokenType.RIGHT_PAREN) {
            return true;
          }
        }
        return false;
      }
      
      if (token.type === TokenType.NEWLINE || token.type === TokenType.COMMENT) {
        lookahead++;
        continue;
      }
      
      return false;
    }
    
    return false;
  }

  private parseFunctionType(): any {
    const parameters: AST.Parameter[] = [];
    
    if (!this.check(TokenType.RIGHT_PAREN)) {
      parameters.push(this.parseParameter());
      while (this.match(TokenType.COMMA)) {
        parameters.push(this.parseParameter());
      }
    }
    
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after function parameters");

    let returnType: any = { type: 'AnyType', location: this.getLocation() };
    if (this.match(TokenType.MINUS) && this.match(TokenType.GREATER_THAN)) {
      returnType = this.parseType();
    }

    return {
      type: 'FunctionType',
      parameters,
      returnType,
      location: this.getLocation(),
    };
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