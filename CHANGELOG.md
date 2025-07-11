# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-07-11

### Added
- Initial release of LuaTS
- Support for parsing Lua and Luau code
- AST generation and manipulation
- TypeScript interface generation from Luau types
- Type conversion between Lua/Luau and TypeScript
- Support for optional types (foo: string? → foo?: string)
- Support for table types ({string} → string[] or Record)
- Conversion of Luau function types to TS arrow functions
- Comment preservation and JSDoc formatting
- CLI tool with file watching capabilities
- Configuration file support
- Plugin system for custom transformations
- Basic inference for inline tables
- Type definitions for exported API
- Comprehensive test suite
