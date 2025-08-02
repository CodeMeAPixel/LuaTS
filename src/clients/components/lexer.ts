import { Token, TokenType } from './types';
import { OPERATORS, SINGLE_CHAR_TOKENS, KEYWORDS } from './operators';
import { 
  TokenizerContext, 
  NumberTokenizer, 
  StringTokenizer, 
  IdentifierTokenizer, 
  CommentTokenizer 
} from './tokenizers';

export { Token, TokenType };

export class Lexer implements TokenizerContext {
  public input: string;
  public position: number = 0;
  public line: number = 1;
  public column: number = 1;

  private tokenizers: Array<NumberTokenizer | StringTokenizer | IdentifierTokenizer | CommentTokenizer> = [];

  constructor(input: string) {
    this.input = input;
    this.initializeTokenizers();
  }

  private initializeTokenizers(): void {
    this.tokenizers = [
      new NumberTokenizer(this),
      new StringTokenizer(this),  
      new IdentifierTokenizer(this, KEYWORDS),
      new CommentTokenizer(this),
    ];
  }

  public tokenize(input: string): Token[] {
    this.input = input;
    this.reset();
    
    const tokens: Token[] = [];
    
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;
      
      const token = this.nextToken();
      tokens.push(token);
    }
    
    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  private reset(): void {
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  private nextToken(): Token {
    const char = this.advance();
    
    // Try specialized tokenizers first
    for (const tokenizer of this.tokenizers) {
      if (tokenizer.canHandle(char)) {
        return tokenizer.tokenize();
      }
    }
    
    if (char === '\n') {
      return this.tokenizeNewline();
    }
    
    // Try multi-character operators
    const multiCharToken = this.tryTokenizeMultiCharOperator(char);
    if (multiCharToken) {
      return multiCharToken;
    }
    
    // Fall back to single character tokens
    const tokenType = SINGLE_CHAR_TOKENS.get(char);
    if (tokenType) {
      return this.createToken(tokenType, char);
    }
    
    throw new Error(`Unexpected character: ${char} at line ${this.line}, column ${this.column}`);
  }

  private tokenizeNewline(): Token {
    this.line++;
    this.column = 1;
    return this.createToken(TokenType.NEWLINE, '\n');
  }

  private tryTokenizeMultiCharOperator(char: string): Token | null {
    const operatorInfo = OPERATORS.get(char);
    if (!operatorInfo) return null;
    
    // Check for triple character operator
    if (operatorInfo.triple && this.peek() === char && this.peek(1) === char) {
      this.advance(); // Second char
      this.advance(); // Third char
      return this.createToken(operatorInfo.triple, char.repeat(3));
    }
    
    // Check for double character operator
    if (operatorInfo.double && this.peek() === char) {
      this.advance(); // Second char
      return this.createToken(operatorInfo.double, char.repeat(2));
    }
    
    // Special cases for operators with different second characters
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
    
    // Return single character operator
    return this.createToken(operatorInfo.single, char);
  }

  // TokenizerContext implementation
  public advance(): string {
    if (this.isAtEnd()) return '\0';
    const char = this.input[this.position];
    this.position++;
    this.column++;
    return char;
  }

  public peek(offset = 0): string {
    if (this.position + offset >= this.input.length) return '\0';
    return this.input[this.position + offset];
  }

  public isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  public createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      start: this.position - value.length,
      end: this.position,
    };
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
}
