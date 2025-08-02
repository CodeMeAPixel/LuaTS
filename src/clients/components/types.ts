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