---
layout: default
title: Type Generator
parent: API Reference
nav_order: 2
---

# Type Generator
{: .no_toc }

The `TypeGenerator` class is responsible for converting Luau type definitions into TypeScript interfaces.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The Type Generator is the core component of LuaTS that transforms Luau type annotations into TypeScript interfaces. It supports various conversion strategies and customization options.

## Usage

```typescript
import { TypeGenerator } from 'luats';
// or
import { TypeGenerator } from 'luats/generators/typescript';

const typeGen = new TypeGenerator({
  useUnknown: true,
  exportTypes: true,
});

// Convert Luau type definitions to TypeScript interfaces
const tsInterfaces = typeGen.generateTypeScript(`
  type Person = {
    name: string,
    age: number,
    tags: {string},  -- Array of strings
    metadata: {[string]: any}?,  -- Optional record type
    greet: (self: Person, greeting: string) -> string  -- Method
  }
`);

console.log(tsInterfaces);
```

## TypeGeneratorOptions

The `TypeGenerator` constructor accepts an options object with the following properties:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `useUnknown` | boolean | `false` | Use `unknown` instead of `any` for unspecified types |
| `exportTypes` | boolean | `true` | Add `export` keyword to generated interfaces |
| `useReadonly` | boolean | `false` | Mark properties as readonly when possible |
| `generateComments` | boolean | `true` | Generate JSDoc comments |
| `arrayType` | 'array' \| 'record' \| 'auto' | `'auto'` | How to convert table array types |
| `preserveTableIndexSignatures` | boolean | `true` | Preserve Lua table index signatures in TS |
| `functionStyle` | 'arrow' \| 'method' \| 'interface' | `'arrow'` | How to represent function types |
| `mergeInterfaces` | boolean | `true` | Merge interfaces with the same name |
| `useNamespaces` | boolean | `false` | Use TS namespaces for organization |
| `inferTypes` | boolean | `false` | Infer types for inline tables |
| `indentSpaces` | number | `2` | Number of spaces for indentation |
| `singleQuote` | boolean | `true` | Use single quotes instead of double quotes |
| `trailingComma` | boolean | `false` | Include trailing commas in object types |

## Methods

| Method | Description |
| --- | --- |
| `constructor(options?: Partial<TypeGeneratorOptions>)` | Creates a new TypeGenerator instance with optional custom options. |
| `generateTypeScript(code: string): string` | Generates TypeScript interfaces from Luau code with type definitions. |
| `generateFromLuauAST(ast: AST.Program): string` | Generates TypeScript interfaces from a Luau AST. |
| `convertLuauTypeToTypeScript(luauType: AST.LuauType): string` | Converts a single Luau type to TypeScript. |
| `processTypeAlias(typeAlias: AST.TypeAlias): void` | Processes a type alias and registers it for output. |
| `getInterface(name: string): TypeScriptInterface` | Gets a previously registered interface by name. |
| `addCustomInterface(interfaceObj: TypeScriptInterface): void` | Adds a custom interface to the generated output. |
| `generateTypeScriptCode(): string` | Generates the final TypeScript code string. |

## Type Conversion Examples

Here are examples of how different Luau types are converted to TypeScript:

### Basic Types

```lua
-- Luau
type Test = {
  name: string,
  age: number,
  isActive: boolean,
  data: any
}
```

```typescript
// TypeScript
export interface Test {
  name: string;
  age: number;
  isActive: boolean;
  data: any;
}
```

### Optional Fields

```lua
-- Luau
type User = {
  id: number,
  email: string?,  -- Optional field
  profile: {
    avatar: string?
  }?  -- Optional nested object
}
```

```typescript
// TypeScript
export interface User {
  id: number;
  email?: string;
  profile?: {
    avatar?: string;
  };
}
```

### Array Types

```lua
-- Luau
type Collection = {
  items: {string},  -- Array of strings
  matrix: {{number}}  -- 2D array of numbers
}
```

```typescript
// TypeScript
export interface Collection {
  items: string[];
  matrix: number[][];
}
```

### Record Types

```lua
-- Luau
type Dictionary = {
  [string]: any,  -- String keys with any values
  [number]: string  -- Number keys with string values
}
```

```typescript
// TypeScript
export interface Dictionary {
  [key: string]: any;
  [key: number]: string;
}
```

### Function Types

```lua
-- Luau
type Callbacks = {
  onClick: (button: string) -> void,
  calculate: (x: number, y: number) -> number,
  greet: (self: any, name: string) -> string  -- Method with self parameter
}
```

```typescript
// TypeScript
export interface Callbacks {
  onClick: (button: string) => void;
  calculate: (x: number, y: number) => number;
  greet: (name: string) => string;  // Self parameter is removed
}
```

## Convenience Function

LuaTS also provides a convenience function for quick type generation:

```typescript
import { generateTypes } from 'luats';

const tsCode = generateTypes(`
  type Vector3 = {
    x: number,
    y: number,
    z: number
  }
`);

console.log(tsCode);
```

## Plugin Support

The TypeGenerator supports plugins for custom transformations:

```typescript
import { generateTypesWithPlugins } from 'luats';

const tsCodeWithPlugins = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  ['./plugins/my-custom-plugin.js']
);
```

See the [Plugin System](../plugins) documentation for more details.
