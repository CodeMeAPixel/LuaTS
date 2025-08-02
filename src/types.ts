// Core AST Node Types
export interface ASTNode {
  type: string;
  location?: SourceLocation | undefined;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

// Lua Value Types
export type LuaValue = 
  | LuaNil
  | LuaBoolean
  | LuaNumber
  | LuaString
  | LuaTable
  | LuaFunction;

export interface LuaNil extends ASTNode {
  type: 'Nil';
}

export interface LuaBoolean extends ASTNode {
  type: 'Boolean';
  value: boolean;
}

export interface LuaNumber extends ASTNode {
  type: 'Number';
  value: number;
}

export interface LuaString extends ASTNode {
  type: 'String';
  value: string;
}

export interface LuaTable extends ASTNode {
  type: 'Table';
  fields: TableField[];
}

export interface TableField extends ASTNode {
  type: 'TableField';
  key: Expression | undefined;
  value: Expression;
}

// Expressions
export type Expression = 
  | LuaValue
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | IndexExpression;

export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator = 
  | '+' | '-' | '*' | '/' | '%' | '^'
  | '..'
  | '<' | '<=' | '>' | '>=' | '==' | '~='
  | 'and' | 'or';

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  argument: Expression;
}

export type UnaryOperator = '-' | 'not' | '#';

export interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

export interface MemberExpression extends ASTNode {
  type: 'MemberExpression';
  object: Expression;
  property: Identifier;
}

export interface IndexExpression extends ASTNode {
  type: 'IndexExpression';
  object: Expression;
  index: Expression;
}

// Statements
export type Statement = 
  | LocalStatement
  | AssignmentStatement
  | FunctionDeclaration
  | IfStatement
  | WhileStatement
  | ForStatement
  | ReturnStatement
  | BreakStatement
  | ExpressionStatement
  | TypeAlias;

export interface LocalStatement extends ASTNode {
  type: 'LocalStatement';
  variables: Identifier[];
  init: Expression[] | undefined;
}

export interface AssignmentStatement extends ASTNode {
  type: 'AssignmentStatement';
  variables: Expression[];
  init: Expression[];
}

export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  identifier: Identifier | undefined;
  isLocal: boolean;
  parameters: Identifier[];
  body: Statement[];
}

export interface LuaFunction extends ASTNode {
  type: 'Function';
  parameters: Identifier[];
  body: Statement[];
}

export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement[];
  alternate: Statement[] | IfStatement | undefined;
}

export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  test: Expression;
  body: Statement[];
}

export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  variable: Identifier;
  start: Expression;
  end: Expression;
  step: Expression | undefined;
  body: Statement[];
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  arguments: Expression[];
}

export interface BreakStatement extends ASTNode {
  type: 'BreakStatement';
}

export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

// Program
export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

// Luau-specific types
export interface TypeAnnotation extends ASTNode {
  type: 'TypeAnnotation';
  typeAnnotation: LuauType;
}

// Add AnyType for extensibility and clarity
export type LuauType = 
  | StringType
  | NumberType
  | BooleanType
  | NilType
  | AnyType
  | UnionType
  | IntersectionType
  | FunctionType
  | TableType
  | ArrayType
  | GenericType;

export interface StringType extends ASTNode {
  type: 'StringType';
}

export interface NumberType extends ASTNode {
  type: 'NumberType';
}

export interface BooleanType extends ASTNode {
  type: 'BooleanType';
}

export interface NilType extends ASTNode {
  type: 'NilType';
}

// Add AnyType for explicit 'any' support
export interface AnyType extends ASTNode {
  type: 'AnyType';
}

export interface UnionType extends ASTNode {
  type: 'UnionType';
  types: LuauType[];
}

export interface IntersectionType extends ASTNode {
  type: 'IntersectionType';
  types: LuauType[];
}

export interface FunctionType extends ASTNode {
  type: 'FunctionType';
  parameters: Parameter[];
  returnType: LuauType | undefined;
}

export interface Parameter extends ASTNode {
  type: 'Parameter';
  name: Identifier;
  typeAnnotation: TypeAnnotation | undefined;
}

export interface TableType extends ASTNode {
  type: 'TableType';
  fields: TableTypeField[];
}

export interface TableTypeField extends ASTNode {
  type: 'TableTypeField';
  key: string | number;
  valueType: LuauType;
  optional: boolean | undefined;
}

export interface GenericType extends ASTNode {
  type: 'GenericType';
  name: string;
  typeParameters: LuauType[] | undefined;
}

export interface TypeAlias extends ASTNode {
  type: 'TypeAlias';
  name: Identifier;
  typeParameters: string[] | undefined;
  definition: LuauType;
}

export interface ArrayType extends ASTNode {
  type: 'ArrayType';
  elementType: LuauType;
}
