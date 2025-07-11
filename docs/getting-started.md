---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started
{: .no_toc }

This guide will help you get started with LuaTS quickly.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

LuaTS can be installed using your preferred package manager:

```bash
# Using bun
bun add luats

# Using npm
npm install luats

# Using yarn
yarn add luats
```

## Basic Usage

### Parsing Lua Code

```typescript
import { LuaParser } from 'luats';

// Parse Lua code
const parser = new LuaParser();
const ast = parser.parse(`
  local function greet(name)
    return "Hello, " .. name
  end
`);

console.log(ast);
```

### Parsing Luau Code (with Types)

```typescript
import { LuauParser } from 'luats';

// Parse Luau code with type annotations
const luauParser = new LuauParser();
const luauAst = luauParser.parse(`
  type Person = {
    name: string,
    age: number
  }
  
  local function createPerson(name: string, age: number): Person
    return { name = name, age = age }
  end
`);

console.log(luauAst);
```

### Formatting Lua Code

```typescript
import { LuaFormatter } from 'luats';

// Format Lua code
const formatter = new LuaFormatter();
const formatted = formatter.format(ast);

console.log(formatted);
```

### Generating TypeScript from Luau Types

```typescript
import { TypeGenerator } from 'luats';

const typeGen = new TypeGenerator();

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
/* Output:
interface Person {
  name: string;
  age: number;
  tags: string[];
  metadata?: Record<string, any>;
  greet: (greeting: string) => string;
}
*/
```

### Convenience Functions

LuaTS provides several convenience functions for common operations:

```typescript
import { 
  parseLua, 
  parseLuau, 
  formatLua, 
  formatLuau, 
  generateTypes,
  generateTypesWithPlugins 
} from 'luats';

// Basic type generation
const tsCode = generateTypes(`
  type Vector3 = {
    x: number,
    y: number,
    z: number
  }
`);

console.log(tsCode);
```

## Direct Module Imports

You can also import specific modules directly:

```typescript
// Import specific parsers
import { LuaParser } from 'luats/parsers/lua';
import { LuauParser } from 'luats/parsers/luau';

// Import formatter
import { LuaFormatter } from 'luats/clients/formatter';

// Import type generator
import { TypeGenerator } from 'luats/generators/typescript';

// Import lexer
import { Lexer } from 'luats/clients/lexer';

// Import AST types
import * as AST from 'luats/types';
```

## Using the CLI

LuaTS includes a command-line interface for easy conversion of Lua/Luau files:

```bash
# Convert a single file
npx luats convert input.lua -o output.ts

# Convert a directory
npx luats dir src/lua -o src/types

# Watch mode (auto-convert on changes)
npx luats dir src/lua -o src/types --watch

# With custom config
npx luats dir src/lua -o src/types --config luats.config.json
```

## Configuration File

You can customize LuaTS behavior using a configuration file (`luats.config.json`):

```json
{
  "outDir": "./types",
  "include": ["**/*.lua", "**/*.luau"],
  "exclude": ["**/node_modules/**"],
  "preserveComments": true,
  "commentStyle": "jsdoc",
  "mergeInterfaces": true,
  "inferTypes": true,
  "plugins": []
}
```

For more advanced usage, check out the [API Reference](./api-reference) and [CLI Documentation](./cli).
