---
layout: default
title: Lexer Architecture
parent: API Reference
nav_order: 6
---

# Lexer Architecture
{: .no_toc }

Understanding LuaTS's modular lexer system and its component-based architecture.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

LuaTS features a sophisticated modular lexer system built with a component-based architecture. This design separates concerns, improves maintainability, and makes it easy to extend with new language features.

## Architecture

### Component Structure

```
src/clients/
├── lexer.ts                 # Main lexer re-export
└── components/
    ├── lexer.ts            # Core lexer implementation
    ├── tokenizers.ts       # Specialized tokenizers
    ├── operators.ts        # Operator definitions
    └── types.ts           # Token type definitions
```

### Design Principles

- **Separation of Concerns**: Each tokenizer handles one type of language construct
- **Extensibility**: Easy to add new tokenizers for language features
- **Maintainability**: Small, focused modules are easier to debug and modify
- **Reusability**: Components can be used independently or combined

## Core Components

### Token Types

All token types are defined in a comprehensive enum:

```typescript
// src/clients/components/types.ts
export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  NIL = 'NIL',

  // Identifiers and Keywords
  IDENTIFIER = 'IDENTIFIER',
  LOCAL = 'LOCAL',
  FUNCTION = 'FUNCTION',
  
  // Luau-specific
  TYPE = 'TYPE',
  EXPORT = 'EXPORT',
  
  // Operators and punctuation
  PLUS = 'PLUS',
  ASSIGN = 'ASSIGN',
  LEFT_PAREN = 'LEFT_PAREN',
  
  // Special tokens
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}
```

### Tokenizer Context

The `TokenizerContext` interface provides a contract for tokenizers to interact with the lexer:

```typescript
export interface TokenizerContext {
  input: string;
  position: number;
  line: number;
  column: number;
  
  // Navigation methods
  advance(): string;
  peek(offset?: number): string;
  isAtEnd(): boolean;
  createToken(type: TokenType, value: string): Token;
}
```

### Base Tokenizer

All specialized tokenizers extend the `BaseTokenizer` class:

```typescript
export abstract class BaseTokenizer {
  protected context: TokenizerContext;

  constructor(context: TokenizerContext) {
    this.context = context;
  }

  abstract canHandle(char: string): boolean;
  abstract tokenize(): Token;
}
```

## Specialized Tokenizers

### NumberTokenizer

Handles numeric literals with comprehensive support:

```typescript
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
    
    // Scientific notation (1e10, 1E-5)
    if (this.context.peek() === 'e' || this.context.peek() === 'E') {
      this.context.advance();
      if (this.context.peek() === '+' || this.context.peek() === '-') {
        this.context.advance();
      }
      while (/\d/.test(this.context.peek())) {
        this.context.advance();
      }
    }
    
    return this.context.createToken(
      TokenType.NUMBER, 
      this.context.input.slice(start, this.context.position)
    );
  }
}
```

**Features:**
- Integer literals: `42`, `0`, `1000`
- Decimal literals: `3.14`, `0.5`, `.125`
- Scientific notation: `1e10`, `2.5E-3`, `1E+6`

### StringTokenizer

Handles string literals including template strings:

```typescript
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
  
  // ...implementation details...
}
```

**Features:**
- Single quotes: `'hello'`
- Double quotes: `"world"`
- Template strings: `` `Hello ${name}` ``
- Escape sequence handling: `"line 1\nline 2"`
- Interpolation support: `` `Count: {value}` ``

### IdentifierTokenizer

Handles identifiers and keywords with contextual parsing:

```typescript
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
    
    // Consume identifier characters
    while (/[a-zA-Z0-9_]/.test(this.context.peek())) {
      this.context.advance();
    }
    
    const value = this.context.input.slice(start, this.context.position);
    
    // Handle contextual keywords
    if (this.isContextualKeywordAsIdentifier(value)) {
      return this.context.createToken(TokenType.IDENTIFIER, value);
    }
    
    const tokenType = this.keywords.get(value) || TokenType.IDENTIFIER;
    return this.context.createToken(tokenType, value);
  }

  private isContextualKeywordAsIdentifier(word: string): boolean {
    const nextToken = this.context.peek();
    const isVariableContext = nextToken === '=' || nextToken === '.' || 
                             nextToken === '[' || nextToken === ':';
    
    const contextualKeywords = ['continue', 'type', 'export'];
    return contextualKeywords.includes(word) && isVariableContext;
  }
}
```

**Features:**
- Standard identifiers: `myVariable`, `_private`, `camelCase`
- Keyword recognition: `local`, `function`, `if`, `then`
- Luau keywords: `type`, `export`, `typeof`
- Contextual parsing: `type` as property name vs keyword

### CommentTokenizer

Handles both single-line and multi-line comments:

```typescript
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
    
    return this.context.createToken(
      TokenType.COMMENT, 
      this.context.input.slice(start, this.context.position)
    );
  }
  
  // ...multiline comment implementation...
}
```

**Features:**
- Single-line comments: `-- This is a comment`
- Multi-line comments: `--[[ This is a multi-line comment ]]`
- Nested multi-line comments: `--[=[ Nested --[[ comment ]] ]=]`

## Operator System

### Operator Definitions

Operators are defined in a structured way to handle multi-character sequences:

```typescript
// src/clients/components/operators.ts
export interface OperatorConfig {
  single: TokenType;
  double?: TokenType;
  triple?: TokenType;
}

export const OPERATORS: Map<string, OperatorConfig> = new Map([
  ['=', { single: TokenType.ASSIGN, double: TokenType.EQUAL }],
  ['~', { single: TokenType.LENGTH, double: TokenType.NOT_EQUAL }],
  ['<', { single: TokenType.LESS_THAN, double: TokenType.LESS_EQUAL }],
  ['>', { single: TokenType.GREATER_THAN, double: TokenType.GREATER_EQUAL }],
  ['.', { single: TokenType.DOT, double: TokenType.CONCAT, triple: TokenType.DOTS }],
  [':', { single: TokenType.COLON, double: TokenType.DOUBLE_COLON }],
]);

export const SINGLE_CHAR_TOKENS: Map<string, TokenType> = new Map([
  ['+', TokenType.PLUS],
  ['-', TokenType.MINUS],
  ['*', TokenType.MULTIPLY],
  ['/', TokenType.DIVIDE],
  // ...more operators...
]);
```

### Multi-Character Operator Handling

The lexer intelligently handles multi-character operators:

```typescript
private tryTokenizeMultiCharOperator(char: string): Token | null {
  const operatorInfo = OPERATORS.get(char);
  if (!operatorInfo) return null;
  
  // Check for triple character operator (...)
  if (operatorInfo.triple && this.peek() === char && this.peek(1) === char) {
    this.advance(); // Second char
    this.advance(); // Third char
    return this.createToken(operatorInfo.triple, char.repeat(3));
  }
  
  // Check for double character operator (==, <=, etc.)
  if (operatorInfo.double && this.peek() === char) {
    this.advance(); // Second char
    return this.createToken(operatorInfo.double, char.repeat(2));
  }
  
  // Return single character operator
  return this.createToken(operatorInfo.single, char);
}
```

## Main Lexer Implementation

### Lexer Class

The main lexer coordinates all tokenizers:

```typescript
export class Lexer implements TokenizerContext {
  public input: string;
  public position: number = 0;
  public line: number = 1;
  public column: number = 1;

  private tokenizers: Array<NumberTokenizer | StringTokenizer | 
                           IdentifierTokenizer | CommentTokenizer> = [];

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

  private nextToken(): Token {
    const char = this.advance();
    
    // Try specialized tokenizers first
    for (const tokenizer of this.tokenizers) {
      if (tokenizer.canHandle(char)) {
        return tokenizer.tokenize();
      }
    }
    
    // Handle special cases
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
  
  // ...TokenizerContext implementation...
}
```

## Usage Examples

### Basic Tokenization

```typescript
import { Lexer, TokenType } from 'luats/clients/lexer';

const lexer = new Lexer(`
  local function greet(name: string): string
    return "Hello, " .. name
  end
`);

const tokens = lexer.tokenize();
tokens.forEach(token => {
  console.log(`${token.type}: "${token.value}" at ${token.line}:${token.column}`);
});

// Output:
// LOCAL: "local" at 2:3
// FUNCTION: "function" at 2:9
// IDENTIFIER: "greet" at 2:18
// LEFT_PAREN: "(" at 2:23
// ...
```

### Working with Individual Tokenizers

```typescript
import { NumberTokenizer, StringTokenizer } from 'luats/clients/lexer';

// Create a mock context for testing
const mockContext = {
  input: '3.14159',
  position: 1,
  line: 1,
  column: 1,
  advance: () => '.',
  peek: () => '1',
  isAtEnd: () => false,
  createToken: (type, value) => ({ type, value, line: 1, column: 1, start: 0, end: 7 })
};

const numberTokenizer = new NumberTokenizer(mockContext);
if (numberTokenizer.canHandle('3')) {
  const token = numberTokenizer.tokenize();
  console.log(token); // { type: 'NUMBER', value: '3.14159', ... }
}
```

## Extending the Lexer

### Adding Custom Tokenizers

```typescript
import { BaseTokenizer, TokenizerContext, TokenType } from 'luats/clients/lexer';

class CustomTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return char === '@'; // Handle custom @ syntax
  }

  tokenize(): Token {
    const start = this.context.position - 1;
    
    // Consume @ and following identifier
    while (/[a-zA-Z0-9_]/.test(this.context.peek())) {
      this.context.advance();
    }
    
    return this.context.createToken(
      TokenType.IDENTIFIER,
      this.context.input.slice(start, this.context.position)
    );
  }
}

// Extend the main lexer
class ExtendedLexer extends Lexer {
  protected initializeTokenizers(): void {
    super.initializeTokenizers();
    this.tokenizers.push(new CustomTokenizer(this));
  }
}
```

### Adding New Token Types

```typescript
// Add to TokenType enum
export enum TokenType {
  // ...existing types...
  ANNOTATION = 'ANNOTATION',  // For @annotation syntax
}

// Update tokenizer to use new type
class AnnotationTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return char === '@';
  }

  tokenize(): Token {
    // Implementation...
    return this.context.createToken(TokenType.ANNOTATION, value);
  }
}
```

## Performance Considerations

### Efficient Character Handling

The lexer is optimized for performance:

- **Single-pass scanning**: Each character is examined only once
- **Lookahead optimization**: Minimal lookahead for multi-character tokens
- **String slicing**: Efficient substring extraction for token values
- **Early returns**: Tokenizers return immediately upon recognition

### Memory Management

- **Token reuse**: Token objects are created only when needed
- **String interning**: Common tokens could be cached (future optimization)
- **Streaming support**: Large files are processed incrementally

## Error Handling

### Lexical Errors

The lexer provides detailed error information:

```typescript
try {
  const tokens = lexer.tokenize(invalidInput);
} catch (error) {
  console.error(`Lexical error: ${error.message}`);
  // Error includes line and column information
}
```

### Recovery Strategies

- **Skip invalid characters**: Continue parsing after errors
- **Context preservation**: Maintain line/column tracking through errors
- **Error tokens**: Optionally emit error tokens instead of throwing

## Future Enhancements

### Planned Features

- **Incremental tokenization**: Update tokens for changed regions only
- **Token streaming**: Generator-based token production for large files
- **Custom operator support**: Allow plugins to define new operators
- **Performance profiling**: Built-in tokenization performance metrics

The modular lexer architecture makes LuaTS both powerful and extensible, providing a solid foundation for parsing Lua and Luau code while remaining maintainable and performant.
