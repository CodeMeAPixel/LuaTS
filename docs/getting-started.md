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
# Using bun (recommended for development)
bun add luats

# Using npm
npm install luats

# Using yarn
yarn add luats
```

## Basic Usage

### Parsing Lua Code

```typescript
import { parseLua } from 'luats';
// or import the class directly
import { LuaParser } from 'luats/parsers/lua';

// Using convenience function
const ast = parseLua(`
  local function greet(name)
    return "Hello, " .. name
  end
  
  print(greet("World"))
`);

console.log(ast);
```

### Parsing Luau Code (with Types)

```typescript
import { parseLuau } from 'luats';
// or import the class directly  
import { LuauParser } from 'luats/parsers/luau';

// Parse Luau code with type annotations
const ast = parseLuau(`
  type Person = {
    name: string,
    age: number,
    active?: boolean
  }
  
  local function createPerson(name: string, age: number): Person
    return { 
      name = name, 
      age = age,
      active = true
    }
  end
`);

console.log(ast);
```

### Generating TypeScript from Luau Types

```typescript
import { generateTypes } from 'luats';

const luauCode = `
  type Vector3 = {
    x: number,
    y: number, 
    z: number
  }
  
  type Player = {
    name: string,
    position: Vector3,
    health: number,
    inventory: {string},  -- Array of strings
    metadata?: {[string]: any},  -- Optional record
    greet: (self: Player, message: string) -> string  -- Method
  }
  
  type GameEvent = "PlayerJoined" | "PlayerLeft" | "PlayerMoved"
`;

const tsCode = generateTypes(luauCode, {
  useUnknown: true,
  includeSemicolons: true,
  interfacePrefix: 'I'
});

console.log(tsCode);
```

**Output:**
```typescript
interface IVector3 {
  x: number;
  y: number;
  z: number;
}

interface IPlayer {
  name: string;
  position: IVector3;
  health: number;
  inventory: string[];
  metadata?: Record<string, unknown>;
  greet: (message: string) => string;  // self parameter removed
}

type GameEvent = "PlayerJoined" | "PlayerLeft" | "PlayerMoved";
```

### Formatting Lua Code

```typescript
import { formatLua } from 'luats';
import { LuaFormatter } from 'luats/clients/formatter';

// Using convenience function
const messyCode = `local x=1+2 local y=x*3 if x>5 then print("big") end`;
const formatted = formatLua(messyCode);

// Using class with custom options
const formatter = new LuaFormatter({
  indentSize: 4,
  insertSpaceAroundOperators: true,
  insertSpaceAfterComma: true,
  maxLineLength: 100
});

const customFormatted = formatter.format(messyCode);
```

### Working with the Lexer

```typescript
import { Lexer, TokenType } from 'luats/clients/lexer';

const lexer = new Lexer(`
  local name: string = "World"
  print("Hello, " .. name)
`);

const tokens = lexer.tokenize();
tokens.forEach(token => {
  console.log(`${token.type}: "${token.value}" at ${token.line}:${token.column}`);
});
```

## Advanced Usage

### Using Plugins

```typescript
import { generateTypesWithPlugins } from 'luats';

// Create a custom plugin
const readonlyPlugin = {
  name: 'ReadonlyPlugin',
  description: 'Makes all properties readonly',
  postProcess: (code) => {
    return code.replace(/^(\s*)([a-zA-Z_]\w*)(\??):\s*(.+);$/gm, 
                       '$1readonly $2$3: $4;');
  }
};

const tsCode = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  [readonlyPlugin]
);
```

### Analyzing Code

```typescript
import { analyze } from 'luats';

const result = analyze(`
  type User = {
    name: string,
    age: number  
  }
  
  local function createUser(name: string, age: number): User
    return { name = name, age = age }
  end
`, true); // true for Luau analysis

console.log(`Errors: ${result.errors.length}`);
console.log(`AST nodes: ${result.ast.body.length}`);
if (result.types) {
  console.log('Generated types:', result.types);
}
```

## Using the CLI

### Basic Commands

```bash
# Convert a single file
npx luats convert src/types.lua -o src/types.d.ts

# Convert all files in a directory  
npx luats convert-dir src/lua -o src/types

# Validate syntax
npx luats validate src/types.lua

# Show help
npx luats --help
```

### Watch Mode

```bash
# Watch for changes and auto-convert
npx luats convert-dir src/lua -o src/types --watch
```

### Using Configuration

Create `luats.config.json`:

```json
{
  "outDir": "./types",
  "include": ["**/*.lua", "**/*.luau"],
  "exclude": ["**/node_modules/**", "**/dist/**"],
  "preserveComments": true,
  "commentStyle": "jsdoc",
  "typeGeneratorOptions": {
    "useUnknown": true,
    "interfacePrefix": "I",
    "includeSemicolons": true
  },
  "plugins": []
}
```

Then run:

```bash
npx luats convert-dir src/lua --config luats.config.json
```

## Examples

### Roblox Development

```lua
-- player.luau
type Vector3 = {
  X: number,
  Y: number, 
  Z: number
}

type Player = {
  Name: string,
  UserId: number,
  Character: Model?,
  Position: Vector3,
  TeamColor: BrickColor
}

export type PlayerData = {
  player: Player,
  stats: {[string]: number},
  inventory: {[string]: number}
}
```

Convert to TypeScript:

```bash
npx luats convert player.luau -o player.d.ts
```

Generated TypeScript:

```typescript
interface Vector3 {
  X: number;
  Y: number;
  Z: number;
}

interface Player {
  Name: string;
  UserId: number;
  Character?: Model;
  Position: Vector3;
  TeamColor: BrickColor;
}

export interface PlayerData {
  player: Player;
  stats: Record<string, number>;
  inventory: Record<string, number>;
}
```

## Next Steps

- Explore the [CLI Documentation](./cli) for advanced command-line usage
- Check out the [API Reference](./api-reference) for detailed documentation
- Learn about the [Plugin System](./plugins) for custom transformations
- Browse [Examples](./examples) for real-world usage patterns
