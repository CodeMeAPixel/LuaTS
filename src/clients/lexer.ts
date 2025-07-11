export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  NIL = 'NIL',

  // Identifiers
  IDENTIFIER = 'IDENTIFIER',

  // Keywords
  AND = 'AND',
  BREAK = 'BREAK',
  CONTINUE = 'CONTINUE',
  DO = 'DO',
  ELSE = 'ELSE',
  ELSEIF = 'ELSEIF',
  END = 'END',
  FALSE = 'FALSE',
  FOR = 'FOR',
  FUNCTION = 'FUNCTION',
  IF = 'IF',
  IN = 'IN',
  LOCAL = 'LOCAL',
  NOT = 'NOT',
  OR = 'OR',
  REPEAT = 'REPEAT',
  RETURN = 'RETURN',
  THEN = 'THEN',
  TRUE = 'TRUE',
  UNTIL = 'UNTIL',
  WHILE = 'WHILE',

  // Luau-specific keywords
  TYPE = 'TYPE',
  EXPORT = 'EXPORT',
  TYPEOF = 'TYPEOF',
  AS = 'AS',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MODULO = 'MODULO',
  POWER = 'POWER',
  CONCAT = 'CONCAT',
  LENGTH = 'LENGTH',

  // Comparison
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  LESS_THAN = 'LESS_THAN',
  LESS_EQUAL = 'LESS_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_EQUAL = 'GREATER_EQUAL',

  // Assignment
  ASSIGN = 'ASSIGN',

  // Punctuation
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  SEMICOLON = 'SEMICOLON',
  COMMA = 'COMMA',
  DOT = 'DOT',
  COLON = 'COLON',
  DOUBLE_COLON = 'DOUBLE_COLON',
  QUESTION = 'QUESTION',
  PIPE = 'PIPE',
  AMPERSAND = 'AMPERSAND',

  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  MULTILINE_COMMENT = 'MULTILINE_COMMENT',
  DOTS = 'DOTS', // '...'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  private keywords: Map<string, TokenType> = new Map([
    ['and', TokenType.AND],
    ['break', TokenType.BREAK],
    ['continue', TokenType.CONTINUE],
    ['do', TokenType.DO],
    ['else', TokenType.ELSE],
    ['elseif', TokenType.ELSEIF],
    ['end', TokenType.END],
    ['false', TokenType.FALSE],
    ['for', TokenType.FOR],
    ['function', TokenType.FUNCTION],
    ['if', TokenType.IF],
    ['in', TokenType.IN],
    ['local', TokenType.LOCAL],
    ['nil', TokenType.NIL],
    ['not', TokenType.NOT],
    ['or', TokenType.OR],
    ['repeat', TokenType.REPEAT],
    ['return', TokenType.RETURN],
    ['then', TokenType.THEN],
    ['true', TokenType.TRUE],
    ['until', TokenType.UNTIL],
    ['while', TokenType.WHILE],
    // Luau keywords
    ['type', TokenType.TYPE],
    ['export', TokenType.EXPORT],
    ['typeof', TokenType.TYPEOF],
    ['as', TokenType.AS],
  ]);

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (
        token.type !== TokenType.WHITESPACE &&
        token.type !== TokenType.COMMENT &&
        token.type !== TokenType.MULTILINE_COMMENT
      ) {
        tokens.push(token);
      }
    }
    
    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  private nextToken(): Token {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return this.createToken(TokenType.EOF, '');
    }

    const char = this.advance();

    // Comments
    if (char === '-' && this.peek() === '-') {
      // Check for long comment
      if (this.peek(1) === '[' && (this.peek(2) === '[' || this.peek(2) === '=')) {
        return this.multilineComment();
      }
      return this.comment();
    }

    // Numbers
    if (this.isDigit(char)) {
      return this.number();
    }

    // Strings
    if (char === '"' || char === "'") {
      return this.string(char);
    }

    // Multi-line strings
    if (char === '[') {
      const next = this.peek();
      if (next === '[' || next === '=') {
        return this.longString();
      }
    }

    // Identifiers and keywords
    if (this.isAlpha(char) || char === '_') {
      return this.identifier();
    }

    // Two-character operators
    if (char === '=' && this.peek() === '=') {
      this.advance();
      return this.createToken(TokenType.EQUAL, '==');
    }
    if (char === '~' && this.peek() === '=') {
      this.advance();
      return this.createToken(TokenType.NOT_EQUAL, '~=');
    }
    if (char === '<' && this.peek() === '=') {
      this.advance();
      return this.createToken(TokenType.LESS_EQUAL, '<=');
    }
    if (char === '>' && this.peek() === '=') {
      this.advance();
      return this.createToken(TokenType.GREATER_EQUAL, '>=');
    }
    if (char === '.' && this.peek() === '.') {
      this.advance();
      return this.createToken(TokenType.CONCAT, '..');
    }
    if (char === ':' && this.peek() === ':') {
      this.advance();
      return this.createToken(TokenType.DOUBLE_COLON, '::');
    }

    // Vararg '...'
    if (char === '.' && this.peek() === '.' && this.peek(1) === '.') {
      this.advance();
      this.advance();
      return this.createToken(TokenType.DOTS, '...');
    }

    // Single-character tokens
    switch (char) {
      case '+': return this.createToken(TokenType.PLUS, char);
      case '-': return this.createToken(TokenType.MINUS, char);
      case '*': return this.createToken(TokenType.MULTIPLY, char);
      case '/': return this.createToken(TokenType.DIVIDE, char);
      case '%': return this.createToken(TokenType.MODULO, char);
      case '^': return this.createToken(TokenType.POWER, char);
      case '#': return this.createToken(TokenType.LENGTH, char);
      case '<': return this.createToken(TokenType.LESS_THAN, char);
      case '>': return this.createToken(TokenType.GREATER_THAN, char);
      case '=': return this.createToken(TokenType.ASSIGN, char);
      case '(': return this.createToken(TokenType.LEFT_PAREN, char);
      case ')': return this.createToken(TokenType.RIGHT_PAREN, char);
      case '[': return this.createToken(TokenType.LEFT_BRACKET, char);
      case ']': return this.createToken(TokenType.RIGHT_BRACKET, char);
      case '{': return this.createToken(TokenType.LEFT_BRACE, char);
      case '}': return this.createToken(TokenType.RIGHT_BRACE, char);
      case ';': return this.createToken(TokenType.SEMICOLON, char);
      case ',': return this.createToken(TokenType.COMMA, char);
      case '.': return this.createToken(TokenType.DOT, char);
      case ':': return this.createToken(TokenType.COLON, char);
      case '?': return this.createToken(TokenType.QUESTION, char);
      case '|': return this.createToken(TokenType.PIPE, char);
      case '&': return this.createToken(TokenType.AMPERSAND, char);
      case '\n': 
        this.line++;
        this.column = 1;
        return this.createToken(TokenType.NEWLINE, char);
      default:
        throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
    }
  }

  private comment(): Token {
    // Skip the second '-'
    this.advance();
    const start = this.position - 2;
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
    return this.createToken(TokenType.COMMENT, this.input.slice(start, this.position));
  }

  private multilineComment(): Token {
    // Skip the second '-' and the opening '['
    this.advance(); // skip '-'
    this.advance(); // skip '['
    let level = 0;
    while (this.peek() === '=') {
      this.advance();
      level++;
    }
    if (this.peek() === '[') {
      this.advance();
    }
    const start = this.position - 4 - level; // --[[ or --[=[ etc.
    const endPattern = ']' + '='.repeat(level) + ']';
    while (!this.isAtEnd()) {
      if (this.input.slice(this.position, this.position + endPattern.length) === endPattern) {
        this.position += endPattern.length;
        break;
      }
      if (this.advance() === '\n') {
        this.line++;
        this.column = 1;
      }
    }
    return this.createToken(TokenType.MULTILINE_COMMENT, this.input.slice(start, this.position));
  }

  private number(): Token {
    const start = this.position - 1;
    
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    
    // Decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    
    // Exponent part
    if (this.peek() === 'e' || this.peek() === 'E') {
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    
    return this.createToken(TokenType.NUMBER, this.input.slice(start, this.position));
  }

  private string(quote: string): Token {
    const start = this.position - 1;
    
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance(); // Skip escape character
        if (!this.isAtEnd()) {
          this.advance(); // Skip escaped character
        }
      } else {
        if (this.advance() === '\n') {
          this.line++;
          this.column = 1;
        }
      }
    }
    
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    
    this.advance(); // Closing quote
    return this.createToken(TokenType.STRING, this.input.slice(start, this.position));
  }

  private longString(): Token {
    const start = this.position - 1;
    const level = this.getLongStringLevel();
    
    if (level < 0) {
      return this.createToken(TokenType.LEFT_BRACKET, '[');
    }
    
    const endPattern = ']' + '='.repeat(level) + ']';
    
    while (!this.isAtEnd()) {
      if (this.input.slice(this.position, this.position + endPattern.length) === endPattern) {
        this.position += endPattern.length;
        break;
      }
      if (this.advance() === '\n') {
        this.line++;
        this.column = 1;
      }
    }
    
    return this.createToken(TokenType.STRING, this.input.slice(start, this.position));
  }

  private getLongStringLevel(): number {
    const start = this.position;
    let level = 0;
    
    while (this.peek() === '=') {
      this.advance();
      level++;
    }
    
    if (this.peek() === '[') {
      this.advance();
      return level;
    }
    
    // Reset position if not a valid long string
    this.position = start;
    return -1;
  }

  private identifier(): Token {
    const start = this.position - 1;
    
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      this.advance();
    }
    
    const value = this.input.slice(start, this.position);
    const type = this.keywords.get(value) || TokenType.IDENTIFIER;
    
    return this.createToken(type, value);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      start: this.position - value.length,
      end: this.position,
    };
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private advance(): string {
    if (this.isAtEnd()) return '\0';
    const char = this.input[this.position];
    this.position++;
    this.column++;
    return char;
  }

  private peek(offset = 0): string {
    if (this.position + offset >= this.input.length) return '\0';
    return this.input[this.position + offset];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return '\0';
    return this.input[this.position + 1];
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || 
           (char >= 'A' && char <= 'Z');
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
