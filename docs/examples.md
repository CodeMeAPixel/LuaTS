---
layout: default
title: Examples
nav_order: 6
---

# Examples
{: .no_toc }

This page provides various examples of using LuaTS in different scenarios.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Basic Type Conversion

Converting simple Luau types to TypeScript interfaces:

### Luau Input

```lua
-- player-types.lua
type Vector2 = {
  x: number,
  y: number
}

type Player = {
  id: number,
  name: string,
  position: Vector2,
  health: number,
  inventory: {string},
  isActive: boolean
}

type GameState = {
  players: {[string]: Player},
  currentLevel: number,
  timeRemaining: number?
}
```

### TypeScript Output

```typescript
// player-types.d.ts
export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  name: string;
  position: Vector2;
  health: number;
  inventory: string[];
  isActive: boolean;
}

export interface GameState {
  players: Record<string, Player>;
  currentLevel: number;
  timeRemaining?: number;
}
```

## Working with Optional Properties

Converting Luau optional types to TypeScript optional properties:

### Luau Input

```lua
type UserProfile = {
  username: string,
  email: string?,  -- Optional email
  avatar: string?,  -- Optional avatar
  settings: {
    theme: string?,
    notifications: boolean?,
    language: string
  }?  -- Optional settings object
}
```

### TypeScript Output

```typescript
export interface UserProfile {
  username: string;
  email?: string;
  avatar?: string;
  settings?: {
    theme?: string;
    notifications?: boolean;
    language: string;
  };
}
```

## Function Types

Converting Luau function types to TypeScript function types:

### Luau Input

```lua
type Callbacks = {
  onClick: (button: string) -> void,
  calculate: (x: number, y: number) -> number,
  validate: (self: any, data: any) -> boolean,
  process: (data: any) -> (boolean, string?)  -- Returns multiple values
}
```

### TypeScript Output

```typescript
export interface Callbacks {
  onClick: (button: string) => void;
  calculate: (x: number, y: number) => number;
  validate: (data: any) => boolean;  // 'self' parameter removed
  process: (data: any) => [boolean, string | undefined];  // Multiple returns as tuple
}
```

## Record Types

Converting Luau dictionary types to TypeScript record types:

### Luau Input

```lua
type Dictionary = {
  [string]: any  -- String keys with any values
}

type NumberMap = {
  [number]: string  -- Number keys with string values
}

type Mixed = {
  [string]: any,
  [number]: boolean,
  name: string  -- Named property
}
```

### TypeScript Output

```typescript
export interface Dictionary {
  [key: string]: any;
}

export interface NumberMap {
  [key: number]: string;
}

export interface Mixed {
  [key: string]: any;
  [key: number]: boolean;
  name: string;
}
```

## Using Plugins

Example of using a plugin to customize type generation:

### Luau Input

```lua
type Person = {
  name: string,
  age: number
}
```

### Plugin Definition

```typescript
// readonly-plugin.ts
import { Plugin } from 'luats';

const ReadonlyPlugin: Plugin = {
  name: 'ReadonlyPlugin',
  description: 'Makes all properties readonly',
  
  transformInterface: (interfaceName, properties, options) => {
    // Mark all properties as readonly
    properties.forEach(prop => {
      prop.readonly = true;
    });
    
    return { name: interfaceName, properties };
  }
};

export default ReadonlyPlugin;
```

### TypeScript Output (with Plugin)

```typescript
export interface Person {
  readonly name: string;
  readonly age: number;
}
```

## Programmatic Usage

Example of using LuaTS programmatically:

```typescript
import { 
  LuauParser, 
  TypeGenerator, 
  LuaFormatter,
  generateTypes
} from 'luats';
import fs from 'fs';

// Simple conversion with convenience function
const luauCode = fs.readFileSync('types.lua', 'utf-8');
const tsInterfaces = generateTypes(luauCode);
fs.writeFileSync('types.d.ts', tsInterfaces, 'utf-8');

// Advanced usage with custom options
const parser = new LuauParser();
const generator = new TypeGenerator({
  useUnknown: true,
  exportTypes: true,
  generateComments: true
});

const ast = parser.parse(luauCode);
const typescriptCode = generator.generateFromLuauAST(ast);
fs.writeFileSync('types-advanced.d.ts', typescriptCode, 'utf-8');

// Formatting Lua code
const formatter = new LuaFormatter({
  indentSize: 2,
  insertSpaceAroundOperators: true
});

const formattedLua = formatter.format(ast);
fs.writeFileSync('formatted.lua', formattedLua, 'utf-8');
```

## CLI Examples

Using the LuaTS CLI:

```bash
# Convert a single file
npx luats convert src/player.lua -o src/player.d.ts

# Convert all files in a directory
npx luats dir src/lua -o src/types

# Watch for changes
npx luats dir src/lua -o src/types --watch

# Use a custom config file
npx luats dir src/lua -o src/types --config custom-config.json
```

## Comment Preservation

Example of preserving comments from Luau code:

### Luau Input

```lua
-- User type definition
-- Represents a user in the system
type User = {
  id: number,  -- Unique identifier
  name: string,  -- Display name
  email: string?,  -- Optional email address
  
  -- User permissions
  permissions: {
    canEdit: boolean,  -- Can edit content
    canDelete: boolean,  -- Can delete content
    isAdmin: boolean  -- Has admin privileges
  }
}
```

### TypeScript Output (with Comment Preservation)

```typescript
/**
 * User type definition
 * Represents a user in the system
 */
export interface User {
  /** Unique identifier */
  id: number;
  /** Display name */
  name: string;
  /** Optional email address */
  email?: string;
  
  /**
   * User permissions
   */
  permissions: {
    /** Can edit content */
    canEdit: boolean;
    /** Can delete content */
    canDelete: boolean;
    /** Has admin privileges */
    isAdmin: boolean;
  };
}
```

## Integration with Build Tools

Example of integrating LuaTS with npm scripts:

```json
{
  "scripts": {
    "build:types": "luats dir src/lua -o src/types",
    "watch:types": "luats dir src/lua -o src/types --watch",
    "prebuild": "npm run build:types"
  }
}
```

Example of using LuaTS in a webpack build process:

```javascript
// webpack.config.js
const { exec } = require('child_process');

module.exports = {
  // webpack configuration
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tapAsync('GenerateTypes', (compilation, callback) => {
          exec('npx luats dir src/lua -o src/types', (err, stdout, stderr) => {
            if (err) {
              console.error(stderr);
            } else {
              console.log(stdout);
            }
            callback();
          });
        });
      },
    },
  ],
};
```
