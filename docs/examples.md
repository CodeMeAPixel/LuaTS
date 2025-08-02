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

## Working with the Modular Lexer

LuaTS features a component-based lexer system. Here's how to work with individual components:

### Using Individual Tokenizers

```typescript
import { 
  Lexer, 
  TokenType,
  NumberTokenizer,
  StringTokenizer,
  IdentifierTokenizer,
  CommentTokenizer 
} from 'luats/clients/lexer';

// Create lexer context
const lexer = new Lexer(`
  local name: string = "World"
  local count: number = 42
  -- This is a comment
`);

// Tokenize and examine results
const tokens = lexer.tokenize();
tokens.forEach(token => {
  console.log(`${token.type}: "${token.value}" at ${token.line}:${token.column}`);
});

// Example output:
// LOCAL: "local" at 2:3
// IDENTIFIER: "name" at 2:9
// COLON: ":" at 2:13
// IDENTIFIER: "string" at 2:21
// ASSIGN: "=" at 2:23
// STRING: ""World"" at 2:31
```

### Custom Tokenizer Implementation

```typescript
import { BaseTokenizer, TokenizerContext, TokenType } from 'luats/clients/lexer';

class CustomTokenizer extends BaseTokenizer {
  canHandle(char: string): boolean {
    return char === '@'; // Handle custom @ symbol
  }

  tokenize(): Token {
    const start = this.context.position - 1;
    
    // Consume @ symbol and following identifier
    while (/[a-zA-Z0-9_]/.test(this.context.peek())) {
      this.context.advance();
    }
    
    return this.context.createToken(
      TokenType.IDENTIFIER, // Or custom token type
      this.context.input.slice(start, this.context.position)
    );
  }
}
```

## Advanced Parsing with AST Manipulation

```typescript
import { parseLuau, LuauParser } from 'luats';
import * as AST from 'luats/types';

const luauCode = `
  type User = {
    name: string,
    age: number,
    permissions: {
      canEdit: boolean,
      canDelete: boolean
    }
  }
`;

// Parse and examine AST structure
const ast = parseLuau(luauCode);

// Walk the AST
function walkAST(node: any, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type}`);
  
  if (node.body) {
    node.body.forEach((child: any) => walkAST(child, depth + 1));
  }
  
  if (node.definition && typeof node.definition === 'object') {
    walkAST(node.definition, depth + 1);
  }
}

walkAST(ast);
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

## Function Types and Method Signatures

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

## Plugin Development Examples

### Type Transformation Plugin

```typescript
// safe-types-plugin.ts
import { Plugin } from 'luats';

const SafeTypesPlugin: Plugin = {
  name: 'SafeTypesPlugin',
  description: 'Wraps primitive types with branded types for safety',
  version: '1.0.0',
  
  transformType: (luauType, tsType, options) => {
    const safeTypes: Record<string, string> = {
      'NumberType': 'SafeNumber',
      'StringType': 'SafeString',
      'BooleanType': 'SafeBoolean'
    };
    
    return safeTypes[luauType] || tsType;
  },
  
  postProcess: (generatedCode, options) => {
    const brandedTypes = `
// Branded types for runtime safety
type SafeNumber = number & { __brand: 'SafeNumber' };
type SafeString = string & { __brand: 'SafeString' };
type SafeBoolean = boolean & { __brand: 'SafeBoolean' };

`;
    return brandedTypes + generatedCode;
  }
};

export default SafeTypesPlugin;
```

### Interface Enhancement Plugin

```typescript
// metadata-plugin.ts  
import { Plugin } from 'luats';

const MetadataPlugin: Plugin = {
  name: 'MetadataPlugin',
  description: 'Adds metadata fields to all interfaces',
  
  transformInterface: (name, properties, options) => {
    const enhancedProperties = [
      ...properties,
      {
        name: '__typename',
        type: `'${name}'`,
        optional: false,
        description: 'Type identifier for runtime checks'
      },
      {
        name: '__metadata',
        type: 'Record<string, unknown>',
        optional: true,
        description: 'Additional runtime metadata'
      }
    ];
    
    return { name, properties: enhancedProperties };
  }
};
```

### Documentation Enhancement Plugin

```typescript
// docs-plugin.ts
import { Plugin } from 'luats';

const DocsPlugin: Plugin = {
  name: 'DocsPlugin',
  description: 'Enhances generated TypeScript with comprehensive documentation',
  
  postProcess: (generatedCode, options) => {
    const header = `/**
 * Auto-generated TypeScript definitions
 * 
 * Generated from Luau type definitions on ${new Date().toISOString()}
 * 
 * @fileoverview Type definitions for Luau interfaces
 * @version ${options.version || '1.0.0'}
 */

`;

    // Add @example tags to interfaces
    const documentedCode = generatedCode.replace(
      /(interface \w+) \{/g,
      (match, interfaceName) => {
        return `/**
 * ${interfaceName}
 * @example
 * const instance: ${interfaceName.split(' ')[1]} = {
 *   // Implementation here
 * };
 */
${match}`;
      }
    );

    return header + documentedCode;
  }
};
```

## Using Multiple Plugins Together

```typescript
import { generateTypesWithPlugins } from 'luats';
import SafeTypesPlugin from './plugins/safe-types-plugin';
import MetadataPlugin from './plugins/metadata-plugin';
import DocsPlugin from './plugins/docs-plugin';

const luauCode = `
  type User = {
    id: number,
    name: string,
    active: boolean
  }
`;

const result = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  [SafeTypesPlugin, MetadataPlugin, DocsPlugin]
);

console.log(result);
```

## Advanced Lexer Usage

### Creating Custom Lexer Components

```typescript
import { Lexer, KEYWORDS, OPERATORS } from 'luats/clients/lexer';

// Extend the lexer with custom operators
const customOperators = new Map([
  ...OPERATORS,
  ['@', { single: TokenType.IDENTIFIER }], // Custom @ operator
  ['$', { single: TokenType.IDENTIFIER }]  // Custom $ operator
]);

// Create lexer with custom configuration
class CustomLexer extends Lexer {
  constructor(input: string) {
    super(input);
    // Custom initialization if needed
  }
  
  // Override tokenization for special cases
  protected tryTokenizeMultiCharOperator(char: string) {
    if (char === '@' && this.peek() === '@') {
      this.advance();
      return this.createToken(TokenType.IDENTIFIER, '@@');
    }
    
    return super.tryTokenizeMultiCharOperator(char);
  }
}
```

## Programmatic Usage Patterns

### Batch Processing

```typescript
import { generateTypes, parseLuau } from 'luats';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

async function processLuauFiles(sourceDir: string, outputDir: string) {
  const luauFiles = glob.sync('**/*.luau', { cwd: sourceDir });
  
  for (const file of luauFiles) {
    const sourcePath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file.replace('.luau', '.d.ts'));
    
    try {
      const luauCode = fs.readFileSync(sourcePath, 'utf-8');
      const tsCode = generateTypes(luauCode, {
        useUnknown: true,
        includeSemicolons: true,
        preserveComments: true
      });
      
      // Ensure output directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, tsCode, 'utf-8');
      
      console.log(`✅ Converted ${file}`);
    } catch (error) {
      console.error(`❌ Failed to convert ${file}:`, error.message);
    }
  }
}

// Usage
processLuauFiles('./src/lua', './src/types');
```

### Watch Mode Implementation

```typescript
import { watch } from 'fs';
import { generateTypes } from 'luats';

function watchLuauFiles(sourceDir: string, outputDir: string) {
  console.log(`👀 Watching ${sourceDir} for changes...`);
  
  watch(sourceDir, { recursive: true }, (eventType, filename) => {
    if (filename?.endsWith('.luau') && eventType === 'change') {
      const sourcePath = path.join(sourceDir, filename);
      const outputPath = path.join(outputDir, filename.replace('.luau', '.d.ts'));
      
      try {
        const luauCode = fs.readFileSync(sourcePath, 'utf-8');
        const tsCode = generateTypes(luauCode);
        
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, tsCode, 'utf-8');
        
        console.log(`🔄 Updated ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to update ${filename}:`, error.message);
      }
    }
  });
}
```

## Integration Examples

### Webpack Integration

```javascript
// webpack.config.js
const { generateTypes } = require('luats');
const glob = require('glob');

class LuauTypesPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('LuauTypesPlugin', (compilation, callback) => {
      const luauFiles = glob.sync('src/**/*.luau');
      
      Promise.all(luauFiles.map(async (file) => {
        const luauCode = require('fs').readFileSync(file, 'utf-8');
        const tsCode = await generateTypes(luauCode);
        const outputPath = file.replace('.luau', '.d.ts');
        
        require('fs').writeFileSync(outputPath, tsCode, 'utf-8');
      })).then(() => {
        console.log('Generated TypeScript definitions from Luau files');
        callback();
      }).catch(callback);
    });
  }
}

module.exports = {
  // ...webpack config
  plugins: [
    new LuauTypesPlugin()
  ]
};
```

### VS Code Extension Integration

```typescript
// extension.ts
import * as vscode from 'vscode';
import { generateTypes, parseLuau } from 'luats';

export function activate(context: vscode.ExtensionContext) {
  // Command to generate TypeScript definitions
  const generateTypesCommand = vscode.commands.registerCommand(
    'luats.generateTypes',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !editor.document.fileName.endsWith('.luau')) {
        vscode.window.showErrorMessage('Please open a .luau file');
        return;
      }

      try {
        const luauCode = editor.document.getText();
        const tsCode = generateTypes(luauCode, {
          useUnknown: true,
          includeSemicolons: true
        });

        const outputPath = editor.document.fileName.replace('.luau', '.d.ts');
        const outputUri = vscode.Uri.file(outputPath);
        
        await vscode.workspace.fs.writeFile(
          outputUri, 
          Buffer.from(tsCode, 'utf-8')
        );

        vscode.window.showInformationMessage(
          `Generated TypeScript definitions: ${outputPath}`
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(generateTypesCommand);
}
```

## Testing with LuaTS

### Unit Testing Generated Types

```typescript
// types.test.ts
import { generateTypes } from 'luats';
import { describe, test, expect } from 'bun:test';

describe('Type Generation', () => {
  test('should generate correct interface', () => {
    const luauCode = `
      type User = {
        id: number,
        name: string,
        active?: boolean
      }
    `;

    const result = generateTypes(luauCode);
    
    expect(result).toContain('interface User');
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('active?: boolean');
  });

  test('should handle complex nested types', () => {
    const luauCode = `
      type Config = {
        database: {
          host: string,
          port: number,
          credentials?: {
            username: string,
            password: string
          }
        },
        features: {string}
      }
    `;

    const result = generateTypes(luauCode);
    
    expect(result).toContain('interface Config');
    expect(result).toContain('database: {');
    expect(result).toContain('credentials?: {');
    expect(result).toContain('features: string[]');
  });
});
```

These examples demonstrate the full power and flexibility of LuaTS, from basic type conversion to advanced plugin development and integration scenarios.
