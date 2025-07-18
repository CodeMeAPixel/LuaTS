---
layout: default
title: AST Types
parent: API Reference
nav_order: 4
---

# AST Types
{: .no_toc }

This page documents the Abstract Syntax Tree (AST) types used in LuaTS.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

LuaTS represents Lua/Luau code as an Abstract Syntax Tree (AST). The AST is a hierarchical representation of the code's structure, used for analysis, transformation, and code generation.

The AST types are exported as a namespace:

```typescript
import * as AST from 'luats/types';
// or
import * as AST from 'luats';
```

## Core Types

### Program

The root of the AST, representing a complete Lua/Luau program:

```typescript
interface Program {
  type: 'Program';
  body: Statement[];
}
```

### Node

The base interface for all AST nodes:

```typescript
interface Node {
  type: string;
  loc?: SourceLocation;
}
```

### SourceLocation

Location information for AST nodes:

```typescript
interface SourceLocation {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  column: number;
}
```

## Statements

### Statement

Base interface for all statement types:

```typescript
interface Statement extends Node {
  // Common properties for statements
}
```

### VariableDeclaration

Local variable declarations:

```typescript
interface VariableDeclaration extends Statement {
  type: 'VariableDeclaration';
  kind: 'local' | 'global';
  declarations: VariableDeclarator[];
}

interface VariableDeclarator extends Node {
  type: 'VariableDeclarator';
  id: Identifier;
  init: Expression | null;
  typeAnnotation?: LuauType;
}
```

### FunctionDeclaration

Function declarations:

```typescript
interface FunctionDeclaration extends Statement {
  type: 'FunctionDeclaration';
  id: Identifier | MemberExpression;
  params: Identifier[];
  body: BlockStatement;
  isLocal: boolean;
  returnType?: LuauType;
  paramTypes?: LuauType[];
}
```

### BlockStatement

A block of statements:

```typescript
interface BlockStatement extends Statement {
  type: 'BlockStatement';
  body: Statement[];
}
```

### ReturnStatement

Return statements:

```typescript
interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  arguments: Expression[];
}
```

### IfStatement

If statements:

```typescript
interface IfStatement extends Statement {
  type: 'IfStatement';
  test: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | IfStatement | null;
}
```

### WhileStatement

While loops:

```typescript
interface WhileStatement extends Statement {
  type: 'WhileStatement';
  test: Expression;
  body: BlockStatement;
}
```

### DoStatement

Do blocks:

```typescript
interface DoStatement extends Statement {
  type: 'DoStatement';
  body: BlockStatement;
}
```

### ForStatement

Numeric for loops:

```typescript
interface ForStatement extends Statement {
  type: 'ForStatement';
  init: Identifier;
  start: Expression;
  end: Expression;
  step: Expression | null;
  body: BlockStatement;
}
```

### ForInStatement

Generic for loops:

```typescript
interface ForInStatement extends Statement {
  type: 'ForInStatement';
  namelist: Identifier[];
  explist: Expression[];
  body: BlockStatement;
}
```

### TypeAlias

Luau type aliases:

```typescript
interface TypeAlias extends Statement {
  type: 'TypeAlias';
  name: Identifier;
  typeAnnotation: LuauType;
  exported: boolean;
}
```

## Expressions

### Expression

Base interface for all expression types:

```typescript
interface Expression extends Node {
  // Common properties for expressions
}
```

### Identifier

Variable and function names:

```typescript
interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
}
```

### Literal

Literal values:

```typescript
interface Literal extends Expression {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}
```

### TableConstructor

Table literals:

```typescript
interface TableConstructor extends Expression {
  type: 'TableConstructor';
  fields: TableField[];
}

interface TableField extends Node {
  type: 'TableField';
  key: Expression | null;  // null for array-like entries
  value: Expression;
}
```

### BinaryExpression

Binary operations:

```typescript
interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  operator: string;  // '+', '-', '*', '/', '^', '%', '..', '<', '<=', '>', '>=', '==', '~=', 'and', 'or'
  left: Expression;
  right: Expression;
}
```

### UnaryExpression

Unary operations:

```typescript
interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: string;  // '-', 'not', '#'
  argument: Expression;
}
```

### CallExpression

Function calls:

```typescript
interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}
```

### MemberExpression

Table field access:

```typescript
interface MemberExpression extends Expression {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean;  // true for t[key], false for t.key
}
```

### FunctionExpression

Anonymous functions:

```typescript
interface FunctionExpression extends Expression {
  type: 'FunctionExpression';
  params: Identifier[];
  body: BlockStatement;
  returnType?: LuauType;
  paramTypes?: LuauType[];
}
```

## Luau Type Annotations

### LuauType

Base interface for all Luau type annotations:

```typescript
interface LuauType extends Node {
  // Common properties for type annotations
}
```

### SimpleType

Basic types:

```typescript
interface SimpleType extends LuauType {
  type: 'SimpleType';
  name: string;  // 'string', 'number', 'boolean', 'any', etc.
}
```

### OptionalType

Optional types (with `?` suffix):

```typescript
interface OptionalType extends LuauType {
  type: 'OptionalType';
  baseType: LuauType;
}
```

### TableType

Table/object types:

```typescript
interface TableType extends LuauType {
  type: 'TableType';
  fields: TableTypeField[];
  indexers: TableTypeIndexer[];
}

interface TableTypeField extends Node {
  type: 'TableTypeField';
  name: string;
  valueType: LuauType;
}

interface TableTypeIndexer extends Node {
  type: 'TableTypeIndexer';
  keyType: LuauType;
  valueType: LuauType;
}
```

### ArrayType

Array types:

```typescript
interface ArrayType extends LuauType {
  type: 'ArrayType';
  elementType: LuauType;
}
```

### FunctionType

Function types:

```typescript
interface FunctionType extends LuauType {
  type: 'FunctionType';
  paramTypes: LuauType[];
  returnType: LuauType;
  hasVararg: boolean;
  hasSelf: boolean;
}
```

### UnionType

Union types:

```typescript
interface UnionType extends LuauType {
  type: 'UnionType';
  types: LuauType[];
}
```

## Example AST

Here's an example of how a simple Luau program is represented as an AST:

### Luau Code

```lua
local function add(a: number, b: number): number
  return a + b
end

type Point = {
  x: number,
  y: number
}

local p: Point = { x = 10, y = 20 }
```

### AST Representation

```json
{
  "type": "Program",
  "body": [
    {
      "type": "FunctionDeclaration",
      "id": {
        "type": "Identifier",
        "name": "add"
      },
      "params": [
        {
          "type": "Identifier",
          "name": "a"
        },
        {
          "type": "Identifier",
          "name": "b"
        }
      ],
      "paramTypes": [
        {
          "type": "SimpleType",
          "name": "number"
        },
        {
          "type": "SimpleType",
          "name": "number"
        }
      ],
      "returnType": {
        "type": "SimpleType",
        "name": "number"
      },
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "arguments": [
              {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                  "type": "Identifier",
                  "name": "a"
                },
                "right": {
                  "type": "Identifier",
                  "name": "b"
                }
              }
            ]
          }
        ]
      },
      "isLocal": true
    },
    {
      "type": "TypeAlias",
      "name": {
        "type": "Identifier",
        "name": "Point"
      },
      "typeAnnotation": {
        "type": "TableType",
        "fields": [
          {
            "type": "TableTypeField",
            "name": "x",
            "valueType": {
              "type": "SimpleType",
              "name": "number"
            }
          },
          {
            "type": "TableTypeField",
            "name": "y",
            "valueType": {
              "type": "SimpleType",
              "name": "number"
            }
          }
        ],
        "indexers": []
      },
      "exported": false
    },
    {
      "type": "VariableDeclaration",
      "kind": "local",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "p"
          },
          "typeAnnotation": {
            "type": "SimpleType",
            "name": "Point"
          },
          "init": {
            "type": "TableConstructor",
            "fields": [
              {
                "type": "TableField",
                "key": {
                  "type": "Identifier",
                  "name": "x"
                },
                "value": {
                  "type": "Literal",
                  "value": 10,
                  "raw": "10"
                }
              },
              {
                "type": "TableField",
                "key": {
                  "type": "Identifier",
                  "name": "y"
                },
                "value": {
                  "type": "Literal",
                  "value": 20,
                  "raw": "20"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
