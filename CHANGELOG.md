# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-08-02

### 🎉 Initial Release

#### Core Parsing & Generation
- **Complete Lua parser** with full AST generation supporting all Lua 5.1+ syntax
- **Advanced Luau parser** with type annotations, generics, and modern syntax features
- **TypeScript code generation** from Luau type definitions with intelligent mapping
- **Lua code formatting** with customizable styling options and pretty-printing
- **AST manipulation utilities** with comprehensive type definitions

#### Advanced Type System
- **Primitive type mapping**: `string`, `number`, `boolean`, `nil` → `null`
- **Optional types**: `foo: string?` → `foo?: string` 
- **Array types**: `{string}` → `string[]` with proper element type detection
- **Record types**: `{[string]: any}` → `Record<string, any>` and index signatures
- **Union types**: `"GET" | "POST" | "PUT"` with string literal preservation
- **Intersection types**: `A & B` with proper parenthesization
- **Function types**: `(x: number) -> string` → `(x: number) => string`
- **Method types**: Automatic `self` parameter removal for class methods
- **Generic types**: Support for parameterized types and type variables
- **Table types**: Complex nested object structures with property signatures

#### Language Features
- **Template string interpolation**: Full backtick string support with `${var}` and `{var}` syntax
- **Continue statements**: Proper parsing with loop context validation
- **Reserved keywords as properties**: Handle `type`, `export`, `function`, `local` as object keys
- **Comment preservation**: Single-line (`--`) and multi-line (`--[[ ]]`) comment handling
- **JSDoc conversion**: Transform Lua comments to TypeScript JSDoc format
- **Export statements**: Support for `export type` declarations
- **String literals**: Proper handling of quoted strings in union types

#### Modular Architecture
- **Component-based lexer**: Specialized tokenizers for numbers, strings, identifiers, comments
- **Pluggable tokenizer system**: Easy extension with new language constructs
- **Operator precedence handling**: Correct parsing of complex expressions
- **Error recovery**: Graceful handling of syntax errors with detailed diagnostics
- **Memory efficient**: Streaming parsing for large files

#### Plugin System
- **File-based plugins**: Load plugins from JavaScript/TypeScript files
- **Inline plugin objects**: Direct plugin integration in code
- **Type transformation hooks**: Customize how Luau types map to TypeScript
- **Interface modification**: Add, remove, or modify generated interface properties
- **Post-processing**: Transform final generated TypeScript code
- **Plugin registry**: Manage multiple plugins with validation
- **Hot reloading**: Plugin cache management for development

#### CLI Tools
- **File conversion**: `luats convert file.lua -o file.d.ts`
- **Directory processing**: `luats convert-dir src/lua -o src/types`
- **Watch mode**: Auto-regeneration on file changes with `--watch`
- **Syntax validation**: `luats validate` for error checking
- **Configuration files**: Support for `luats.config.json` with rich options
- **Glob patterns**: Include/exclude file patterns for batch processing

#### Developer Experience
- **Comprehensive TypeScript definitions**: Full type safety for all APIs
- **Error handling**: Detailed error messages with line/column information
- **Snapshot testing**: Fixture-based testing for regression prevention
- **Performance optimizations**: Efficient parsing and generation algorithms
- **Documentation generation**: Generate docs from parsed code structures

#### Configuration Options
- **Type generation**: `useUnknown`, `interfacePrefix`, `includeSemicolons`
- **Comment handling**: `preserveComments`, `commentStyle` (jsdoc/inline)
- **Code formatting**: Indentation, spacing, and style preferences
- **Plugin configuration**: File paths and plugin-specific options
- **Include/exclude patterns**: Fine-grained control over processed files

#### Testing & Quality
- **47 comprehensive tests** covering all major functionality
- **100% test pass rate** with robust edge case handling
- **Snapshot testing** for generated TypeScript output validation
- **Plugin system testing** with both file and object-based plugins
- **CLI integration tests** with temporary file handling
- **Error scenario testing** for graceful failure handling

#### Examples & Documentation
- **Plugin examples**: ReadonlyPlugin, CustomNumberPlugin, TypeMapperPlugin
- **CLI usage examples**: Common workflows and configuration patterns
- **API examples**: Programmatic usage for all major features
- **Roblox integration**: Specific examples for game development workflows

### Technical Details
- **Lexer**: 4 specialized tokenizers (Number, String, Identifier, Comment)
- **Parser**: Recursive descent with operator precedence and error recovery
- **Type System**: 15+ AST node types with full TypeScript definitions
- **Plugin Architecture**: 4 transformation hooks (transformType, transformInterface, process, postProcess)
- **CLI**: 4 main commands with configuration file support
- **Exports**: Modular imports for tree-shaking and selective usage

This release establishes LuaTS as a production-ready tool for Lua/Luau to TypeScript workflows, with particular strength in Roblox development, legacy code integration, and type-safe API definitions.
