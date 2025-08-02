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

LuaTS provides a comprehensive API for parsing, formatting, and type generation. The main components are:

## Core Components

- **LuaParser**: Parse standard Lua code into an Abstract Syntax Tree.
- **LuauParser**: Parse Luau code with support for type annotations and modern syntax features.
- **LuaFormatter**: Format Lua/Luau code with customizable styling options.
- **TypeGenerator**: Generate TypeScript interfaces from Luau type definitions.
- **MarkdownGenerator**: Generate Markdown documentation from API/type definitions.  
  See [`src/generators/markdown/generator.ts`](../src/generators/markdown/generator.ts).
- **Lexer**: Tokenize Lua/Luau code.

## Convenience Functions

- **parseLua(code)**: Parse Lua code and return an AST.
- **parseLuau(code)**: Parse Luau code with type annotations and return an AST.
- **formatLua(ast)**: Format an AST back to Lua code.
- **formatLuau(ast)**: Format an AST back to Luau code.
- **generateTypes(code, options?)**: Generate TypeScript interfaces from Luau type definitions.
- **generateTypesWithPlugins(code, options?, plugins?)**: Generate TypeScript interfaces with plugin support.
- **analyze(code, isLuau?)**: Analyze code and return detailed information.

## Additional Components

- **MarkdownGenerator**: Generate Markdown documentation from parsed API/type definitions.  
  See [`src/generators/markdown/generator.ts`](../src/generators/markdown/generator.ts).
- **Plugin System**: Extend and customize type generation.  
  See [Plugin System Documentation](../plugins.md) for full details and examples.

## Type Definitions

LuaTS exports various TypeScript interfaces and types to help you work with the library:

- **AST**: Abstract Syntax Tree types for Lua/Luau code.
- **Token**: Represents a token in the lexical analysis.
- **FormatterOptions**: Options for formatting code.
- **TypeGeneratorOptions**: Options for generating TypeScript code.
- **Plugin**: Interface for creating plugins.
For detailed information on each component, see the individual API pages in this section.
