---
layout: default
title: API Reference
nav_order: 3
has_children: true
permalink: /api-reference
---

# API Reference
{: .no_toc }

This section provides detailed documentation for the LuaTS API.
{: .fs-6 .fw-300 }

LuaTS provides a comprehensive API for parsing, formatting, and type generation. The library is built with a modular architecture that separates concerns across different components.

## Core Components

### Parsers
- **[LuaParser](./api-reference/parsers)**: Parse standard Lua code into Abstract Syntax Trees
- **[LuauParser](./api-reference/parsers)**: Parse Luau code with type annotations and modern syntax

### Clients  
- **[LuaFormatter](./api-reference/formatter)**: Format Lua/Luau code with customizable styling
- **[Lexer](./api-reference/lexer)**: Tokenize Lua/Luau code with component-based architecture

### Generators
- **[TypeGenerator](./api-reference/type-generator)**: Convert Luau types to TypeScript interfaces
- **[MarkdownGenerator](./api-reference/markdown-generator)**: Generate documentation from API definitions

### Plugin System
- **[Plugin Interface](../plugins)**: Extend and customize type generation
- **Plugin Registry**: Manage multiple plugins
- **File-based Plugin Loading**: Load plugins from JavaScript/TypeScript files

## Convenience Functions

These functions provide quick access to common operations:

```typescript
import { 
  parseLua, 
  parseLuau, 
  formatLua, 
  generateTypes,
  generateTypesWithPlugins,
  analyze 
} from 'luats';
```

| Function | Description | Returns |
|----------|-------------|---------|
| `parseLua(code)` | Parse Lua code | `AST.Program` |
| `parseLuau(code)` | Parse Luau code with types | `AST.Program` |
| `formatLua(ast)` | Format AST to Lua code | `string` |
| `generateTypes(code, options?)` | Generate TypeScript from Luau | `string` |
| `generateTypesWithPlugins(code, options?, plugins?)` | Generate with plugins | `Promise<string>` |
| `analyze(code, isLuau?)` | Analyze code structure | `AnalysisResult` |

## Type Definitions

LuaTS exports comprehensive TypeScript definitions:

```typescript
import * as AST from 'luats/types';
import { Token, TokenType } from 'luats/clients/lexer';
import { TypeGeneratorOptions } from 'luats/generators/typescript';
import { Plugin } from 'luats/plugins/plugin-system';
```

### Core Types

- **AST Nodes**: Complete type definitions for Lua/Luau syntax trees
- **Tokens**: Lexical analysis tokens with position information
- **Options**: Configuration interfaces for all components
- **Plugin Interface**: Type-safe plugin development

## Modular Imports

You can import specific modules for fine-grained control:

```typescript
// Parsers
import { LuaParser } from 'luats/parsers/lua';
import { LuauParser } from 'luats/parsers/luau';

// Clients
import { LuaFormatter } from 'luats/clients/formatter';
import { Lexer } from 'luats/clients/lexer';

// Generators
import { TypeGenerator } from 'luats/generators/typescript';
import { MarkdownGenerator } from 'luats/generators/markdown';

// Plugin System
import { loadPlugin, applyPlugins } from 'luats/plugins/plugin-system';
```

## Architecture Overview

LuaTS uses a modular architecture with clear separation of concerns:

```
src/
├── parsers/          # Code parsing (Lua, Luau)
├── clients/          # Code processing (Lexer, Formatter)  
│   └── components/   # Modular lexer components
├── generators/       # Code generation (TypeScript, Markdown)
├── plugins/          # Plugin system and extensions
├── cli/              # Command-line interface
└── types.ts          # Core AST type definitions
```

### Component Features

- **Modular Lexer**: Specialized tokenizers for different language constructs
- **Plugin Architecture**: Extensible transformation pipeline
- **Type-Safe APIs**: Full TypeScript support throughout
- **Configuration System**: Flexible options for all components

## Error Handling

All components provide comprehensive error handling:

```typescript
import { ParseError } from 'luats/parsers/lua';

try {
  const ast = parseLua(invalidCode);
} catch (error) {
  if (error instanceof ParseError) {
    console.error(`Parse error at ${error.token.line}:${error.token.column}`);
  }
}
```

## Performance Considerations

- **Streaming Parsing**: Efficient memory usage for large files
- **Incremental Tokenization**: Process code in chunks
- **Plugin Caching**: Reuse plugin transformations
- **AST Reuse**: Share parsed trees across operations

For detailed information on each component, see the individual API pages in this section.
