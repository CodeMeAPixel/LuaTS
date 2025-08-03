import { Token, TokenType, Lexer } from '../clients/lexer';
import * as AST from '../types';

export class ParseError extends Error {
  constructor(message: string, public token: Token) {
    super(message);
    this.name = 'ParseError';
  }
}

export class LuaParser {
  private tokens: Token[] = [];
  private current: number = 0;
  private input: string;

  constructor(input: string = '') {
    this.input = input;
  }

  public setTokens(tokens: Token[], position: number): void {
    this.tokens = tokens;
    this.current = position;
  }

  public parseStatement(): any {
    // Implementation for parsing statements
    return null; // Placeholder
  }

  public getCurrentPosition(): number {
    return this.current;
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

    while (!this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) {
        continue;
      }
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      } else {
        // Prevent infinite loop: advance if statement() returned null
        this.advance();
      }
      safetyCounter++;
      if (safetyCounter > 10000) {
        throw new Error('Parser safety break: too many iterations (possible infinite loop)');
      }
    }

    return {
      type: 'Program',
      body: statements,
      location: this.getLocation(),
    };
  }

  private statement(): AST.Statement | null {
    try {
      if (this.match(TokenType.LOCAL)) return this.localStatement();
      if (this.match(TokenType.FUNCTION)) return this.functionDeclaration(false);
      if (this.match(TokenType.IF)) return this.ifStatement();
      if (this.match(TokenType.WHILE)) return this.whileStatement();
      if (this.match(TokenType.FOR)) return this.forStatement();
      if (this.match(TokenType.RETURN)) return this.returnStatement();
      if (this.match(TokenType.BREAK)) return this.breakStatement();
      
      return this.assignmentOrExpressionStatement();
    } catch (error) {
      this.synchronize();
      return null;
    }
  }

  private localStatement(): AST.Statement {
    if (this.match(TokenType.FUNCTION)) {
      return this.functionDeclaration(true);
    }

    const variables: AST.Identifier[] = [];
    variables.push(this.identifier());

    while (this.match(TokenType.COMMA)) {
      variables.push(this.identifier());
    }

    let init: AST.Expression[] | undefined;
    if (this.match(TokenType.ASSIGN)) {
      init = [];
      init.push(this.expression());
      
      while (this.match(TokenType.COMMA)) {
        init.push(this.expression());
      }
    }

    return {
      type: 'LocalStatement',
      variables,
      init,
      location: this.getLocation(),
    };
  }

  private functionDeclaration(isLocal: boolean): AST.FunctionDeclaration {
    let identifier: AST.Identifier | undefined;
    
    if (!isLocal || this.check(TokenType.IDENTIFIER)) {
      identifier = this.identifier();
    }

    this.consume(TokenType.LEFT_PAREN, "Expected '(' after function name");
    
    const parameters: AST.Identifier[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      parameters.push(this.identifier());
      while (this.match(TokenType.COMMA)) {
        parameters.push(this.identifier());
      }
    }
    
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
    
    const body: AST.Statement[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      const stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    
    this.consume(TokenType.END, "Expected 'end' after function body");

    return {
      type: 'FunctionDeclaration',
      identifier,
      isLocal,
      parameters,
      body,
      location: this.getLocation(),
    };
  }

  private ifStatement(): AST.IfStatement {
    const test = this.expression();
    this.consume(TokenType.THEN, "Expected 'then' after if condition");
    
    const consequent: AST.Statement[] = [];
    while (!this.check(TokenType.ELSEIF) && !this.check(TokenType.ELSE) && 
           !this.check(TokenType.END) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      const stmt = this.statement();
      if (stmt) consequent.push(stmt);
    }
    
    let alternate: AST.Statement[] | AST.IfStatement | undefined;
    if (this.match(TokenType.ELSEIF)) {
      alternate = this.ifStatement();
    } else if (this.match(TokenType.ELSE)) {
      alternate = [];
      while (!this.check(TokenType.END) && !this.isAtEnd()) {
        if (this.match(TokenType.NEWLINE)) continue;
        const stmt = this.statement();
        if (stmt) alternate.push(stmt);
      }
    }
    
    this.consume(TokenType.END, "Expected 'end' after if statement");

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
      location: this.getLocation(),
    };
  }

  private whileStatement(): AST.WhileStatement {
    const test = this.expression();
    this.consume(TokenType.DO, "Expected 'do' after while condition");
    
    const body: AST.Statement[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      const stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    
    this.consume(TokenType.END, "Expected 'end' after while body");

    return {
      type: 'WhileStatement',
      test,
      body,
      location: this.getLocation(),
    };
  }

  private forStatement(): AST.ForStatement {
    const variable = this.identifier();
    this.consume(TokenType.ASSIGN, "Expected '=' after for variable");
    
    const start = this.expression();
    this.consume(TokenType.COMMA, "Expected ',' after for start value");
    
    const end = this.expression();
    let step: AST.Expression | undefined;
    
    if (this.match(TokenType.COMMA)) {
      step = this.expression();
    }
    
    this.consume(TokenType.DO, "Expected 'do' after for clause");
    
    const body: AST.Statement[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      const stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    
    this.consume(TokenType.END, "Expected 'end' after for body");

    return {
      type: 'ForStatement',
      variable,
      start,
      end,
      step,
      body,
      location: this.getLocation(),
    };
  }

  private returnStatement(): AST.ReturnStatement {
    const args: AST.Expression[] = [];
    
    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) && 
        !this.check(TokenType.END) && !this.check(TokenType.ELSE) &&
        !this.check(TokenType.ELSEIF)) {
      args.push(this.expression());
      
      while (this.match(TokenType.COMMA)) {
        args.push(this.expression());
      }
    }

    return {
      type: 'ReturnStatement',
      arguments: args,
      location: this.getLocation(),
    };
  }

  private breakStatement(): AST.BreakStatement {
    return {
      type: 'BreakStatement',
      location: this.getLocation(),
    };
  }

  private assignmentOrExpressionStatement(): AST.Statement {
    const expr = this.expression();
    
    if (this.match(TokenType.ASSIGN)) {
      const variables = [expr];
      while (this.match(TokenType.COMMA)) {
        variables.push(this.expression());
      }
      
      const init: AST.Expression[] = [];
      init.push(this.expression());
      
      while (this.match(TokenType.COMMA)) {
        init.push(this.expression());
      }
      
      return {
        type: 'AssignmentStatement',
        variables,
        init,
        location: this.getLocation(),
      };
    }
    
    return {
      type: 'ExpressionStatement',
      expression: expr,
      location: this.getLocation(),
    };
  }

  private expression(): AST.Expression {
    return this.or();
  }

  private or(): AST.Expression {
    let expr = this.and();
    
    while (this.match(TokenType.OR)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.and();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private and(): AST.Expression {
    let expr = this.equality();
    
    while (this.match(TokenType.AND)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.equality();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private equality(): AST.Expression {
    let expr = this.comparison();
    
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.comparison();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private comparison(): AST.Expression {
    let expr = this.concatenation();
    
    while (this.match(TokenType.GREATER_THAN, TokenType.GREATER_EQUAL, 
                      TokenType.LESS_THAN, TokenType.LESS_EQUAL)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.concatenation();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private concatenation(): AST.Expression {
    let expr = this.term();
    
    while (this.match(TokenType.CONCAT)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.term();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private term(): AST.Expression {
    let expr = this.factor();
    
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.factor();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private factor(): AST.Expression {
    let expr = this.unary();
    
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.unary();
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private unary(): AST.Expression {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.LENGTH)) {
      const operator = this.previous().value as AST.UnaryOperator;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator,
        argument: right,
        location: this.getLocation(),
      };
    }
    
    return this.power();
  }

  private power(): AST.Expression {
    let expr = this.call();
    
    if (this.match(TokenType.POWER)) {
      const operator = this.previous().value as AST.BinaryOperator;
      const right = this.unary(); // Right associative
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        location: this.getLocation(),
      };
    }
    
    return expr;
  }

  private call(): AST.Expression {
    let expr = this.primary();
    
    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const property = this.identifier();
        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
          location: this.getLocation(),
        };
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        const index = this.expression();
        this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after index");
        expr = {
          type: 'IndexExpression',
          object: expr,
          index,
          location: this.getLocation(),
        };
      } else {
        break;
      }
    }
    
    return expr;
  }

  private finishCall(callee: AST.Expression): AST.CallExpression {
    const args: AST.Expression[] = [];
    
    if (!this.check(TokenType.RIGHT_PAREN)) {
      args.push(this.expression());
      while (this.match(TokenType.COMMA)) {
        args.push(this.expression());
      }
    }
    
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after arguments");
    
    return {
      type: 'CallExpression',
      callee,
      arguments: args,
      location: this.getLocation(),
    };
  }

  private primary(): AST.Expression {
    if (this.match(TokenType.TRUE)) {
      return {
        type: 'Boolean',
        value: true,
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.FALSE)) {
      return {
        type: 'Boolean',
        value: false,
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.NIL)) {
      return {
        type: 'Nil',
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'Number',
        value: parseFloat(this.previous().value),
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.STRING)) {
      const value = this.previous().value;
      // Remove quotes and handle escape sequences
      const unquoted = value.slice(1, -1);
      return {
        type: 'String',
        value: unquoted,
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: 'Identifier',
        name: this.previous().value,
        location: this.getLocation(),
      };
    }
    
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }
    
    if (this.match(TokenType.LEFT_BRACE)) {
      return this.table();
    }
    
    if (this.match(TokenType.FUNCTION)) {
      return this.functionExpression();
    }
    
    throw new ParseError(`Unexpected token: ${this.peek().value}`, this.peek());
  }

  private table(): AST.LuaTable {
    const fields: AST.TableField[] = [];
    
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.COMMA) || this.match(TokenType.SEMICOLON)) {
        continue;
      }
      
      let key: AST.Expression | undefined;
      let value: AST.Expression;
      
      if (this.match(TokenType.LEFT_BRACKET)) {
        key = this.expression();
        this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after table key");
        this.consume(TokenType.ASSIGN, "Expected '=' after table key");
        value = this.expression();
      } else if (this.check(TokenType.IDENTIFIER) && this.peekNext().type === TokenType.ASSIGN) {
        key = this.identifier();
        this.consume(TokenType.ASSIGN, "Expected '=' after table key");
        value = this.expression();
      } else {
        value = this.expression();
      }
      
      fields.push({
        type: 'TableField',
        key,
        value,
        location: this.getLocation(),
      });
      
      if (!this.match(TokenType.COMMA) && !this.match(TokenType.SEMICOLON)) {
        break;
      }
    }
    
    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after table");
    
    return {
      type: 'Table',
      fields,
      location: this.getLocation(),
    };
  }

  private functionExpression(): AST.LuaFunction {
    this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'function'");
    
    const parameters: AST.Identifier[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      parameters.push(this.identifier());
      while (this.match(TokenType.COMMA)) {
        parameters.push(this.identifier());
      }
    }
    
    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after parameters");
    
    const body: AST.Statement[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      const stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    
    this.consume(TokenType.END, "Expected 'end' after function body");

    return {
      type: 'Function',
      parameters,
      body,
      location: this.getLocation(),
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

  private peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF token
    }
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    throw new ParseError(message, this.peek());
  }

  private synchronize(): void {
    this.advance();
    
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.NEWLINE) return;
      
      switch (this.peek().type) {
        case TokenType.FUNCTION:
        case TokenType.LOCAL:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.RETURN:
          return;
      }
      
      this.advance();
    }
  }

  private getLocation(): AST.SourceLocation {
    const token = this.previous();
    return {
      start: { line: token.line, column: token.column },
      end: { line: token.line, column: token.column + token.value.length },
    };
  }
}