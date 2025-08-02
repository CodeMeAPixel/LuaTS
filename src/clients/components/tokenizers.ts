import { Token, TokenType } from './types';

export interface TokenizerContext {
  input: string;
  position: number;
  line: number;
  column: number;
  
  // Helper methods
  advance(): string;
  peek(offset?: number): string;
  isAtEnd(): boolean;
  createToken(type: TokenType, value: string): Token;
}

export abstract class BaseTokenizer {
  protected context: TokenizerContext;

  constructor(context: TokenizerContext) {
    this.context = context;
  }

  abstract canHandle(char: string): boolean;
  abstract tokenize(): Token;
}

export class NumberTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return /\d/.test(char);
  }

  tokenize(): Token {
    const start = this.context.position - 1;
    
    // Integer part
    while (/\d/.test(this.context.peek())) {
      this.context.advance();
    }
    
    // Decimal part
    if (this.context.peek() === '.' && /\d/.test(this.context.peek(1))) {
      this.context.advance(); // consume '.'
      while (/\d/.test(this.context.peek())) {
        this.context.advance();
      }
    }
    
    // Scientific notation
    if (this.context.peek() === 'e' || this.context.peek() === 'E') {
      this.context.advance();
      if (this.context.peek() === '+' || this.context.peek() === '-') {
        this.context.advance();
      }
      while (/\d/.test(this.context.peek())) {
        this.context.advance();
      }
    }
    
    return this.context.createToken(TokenType.NUMBER, this.context.input.slice(start, this.context.position));
  }
}

export class StringTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return char === '"' || char === "'" || char === '`';
  }

  tokenize(): Token {
    const quote = this.context.input[this.context.position - 1];
    const start = this.context.position - 1;
    
    if (quote === '`') {
      return this.tokenizeTemplateString(start);
    }
    
    return this.tokenizeRegularString(quote, start);
  }

  private tokenizeRegularString(quote: string, start: number): Token {
    while (!this.context.isAtEnd() && this.context.peek() !== quote) {
      if (this.context.peek() === '\\') {
        this.context.advance(); // Skip escape sequence
        if (!this.context.isAtEnd()) {
          this.context.advance();
        }
      } else {
        if (this.context.peek() === '\n') {
          this.context.line++;
          this.context.column = 1;
        }
        this.context.advance();
      }
    }
    
    if (this.context.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.context.line}`);
    }
    
    this.context.advance(); // Closing quote
    return this.context.createToken(TokenType.STRING, this.context.input.slice(start, this.context.position));
  }

  private tokenizeTemplateString(start: number): Token {
    while (!this.context.isAtEnd() && this.context.peek() !== '`') {
      if (this.context.peek() === '\\') {
        this.context.advance(); // Skip escape sequence
        if (!this.context.isAtEnd()) {
          this.context.advance();
        }
      } else if (this.context.peek() === '{') {
        // Handle interpolation expressions
        this.context.advance();
        let braceCount = 1;
        
        while (!this.context.isAtEnd() && braceCount > 0) {
          if (this.context.peek() === '{') {
            braceCount++;
          } else if (this.context.peek() === '}') {
            braceCount--;
          }
          this.context.advance();
        }
      } else {
        if (this.context.peek() === '\n') {
          this.context.line++;
          this.context.column = 1;
        }
        this.context.advance();
      }
    }
    
    if (this.context.isAtEnd()) {
      throw new Error(`Unterminated template string at line ${this.context.line}`);
    }
    
    this.context.advance(); // Closing backtick
    return this.context.createToken(TokenType.STRING, this.context.input.slice(start, this.context.position));
  }
}

export class IdentifierTokenizer extends BaseTokenizer {
  private keywords: Map<string, TokenType>;

  constructor(context: TokenizerContext, keywords: Map<string, TokenType>) {
    super(context);
    this.keywords = keywords;
  }

  canHandle(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  tokenize(): Token {
    const start = this.context.position - 1;
    
    while (/[a-zA-Z0-9_]/.test(this.context.peek())) {
      this.context.advance();
    }
    
    const value = this.context.input.slice(start, this.context.position);
    
    // Handle contextual keywords (can be used as identifiers in certain contexts)
    if (this.isContextualKeywordAsIdentifier(value)) {
      return this.context.createToken(TokenType.IDENTIFIER, value);
    }
    
    const tokenType = this.keywords.get(value) || TokenType.IDENTIFIER;
    return this.context.createToken(tokenType, value);
  }

  private isContextualKeywordAsIdentifier(word: string): boolean {
    const nextToken = this.context.peek();
    const isVariableContext = nextToken === '=' || nextToken === '.' || nextToken === '[' || nextToken === ':';
    
    const contextualKeywords = ['continue', 'type', 'export'];
    return contextualKeywords.includes(word) && isVariableContext;
  }
}

export class CommentTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return char === '-' && this.context.peek() === '-';
  }

  tokenize(): Token {
    const start = this.context.position - 1;
    this.context.advance(); // Skip second '-'
    
    // Check for multiline comment
    if (this.context.peek() === '[') {
      return this.tokenizeMultilineComment(start);
    }
    
    // Single line comment
    while (!this.context.isAtEnd() && this.context.peek() !== '\n') {
      this.context.advance();
    }
    
    return this.context.createToken(TokenType.COMMENT, this.context.input.slice(start, this.context.position));
  }

  private tokenizeMultilineComment(start: number): Token {
    this.context.advance(); // Skip '['
    
    let level = 0;
    while (this.context.peek() === '=') {
      this.context.advance();
      level++;
    }
    
    if (this.context.peek() === '[') {
      this.context.advance();
    }
    
    const endPattern = ']' + '='.repeat(level) + ']';
    
    while (!this.context.isAtEnd()) {
      if (this.context.input.slice(this.context.position, this.context.position + endPattern.length) === endPattern) {
        this.context.position += endPattern.length;
        break;
      }
      
      if (this.context.peek() === '\n') {
        this.context.line++;
        this.context.column = 1;
      }
      
      this.context.advance();
    }
    
    return this.context.createToken(TokenType.MULTILINE_COMMENT, this.context.input.slice(start, this.context.position));
  }
}
