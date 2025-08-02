# Luats Test Suite

This directory contains the comprehensive test suite for the Luats library. The tests ensure that all the features listed in the main README are working correctly.

## Test Structure

- **index.test.ts**: Core functionality tests
- **features.test.ts**: Feature-specific tests covering all major functionality
- **types.test.ts**: Advanced type conversion tests
- **cli.test.ts**: CLI tool tests
- **plugins.test.ts**: Plugin system tests
- **snapshots.test.ts**: Snapshot testing for type generation

## Test Coverage

The test suite aims to provide comprehensive coverage of the Luats codebase. You can run the tests with coverage reports using:

```bash
bun test --coverage
```

After running tests, coverage is reported in `test/lcov.info`.  
You can use [coverage tools](https://github.com/bcoe/nyc) to visualize this file.

## Fixtures and Snapshots

The test suite includes fixture-based testing:

- `fixtures/`: Contains Lua/Luau test files
- `snapshots/`: Contains expected TypeScript output for fixture tests

## Additional Functionality

### Markdown Generator

Luats includes a Markdown generator for API documentation.  
See [`src/generators/markdown/generator.ts`](../src/generators/markdown/generator.ts) and [API Reference: Markdown Generator](../docs/api-reference.md).

### Plugin System

Luats supports a plugin system for customizing type generation and transformation.  
See [`src/plugins/`](../src/plugins/) and [Plugin System Documentation](../docs/plugins.md) for details and usage examples.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run a specific test file
bun test test/features.test.ts

# Run tests with coverage
bun test --coverage
```

## Adding New Tests

When adding new features to Luats, please add corresponding tests:

1. For core functionality, add to `features.test.ts`
2. For CLI features, add to `cli.test.ts`
3. For advanced type conversions, add to `types.test.ts`
4. For plugin functionality, add to `plugins.test.ts`
5. For snapshot tests, add fixtures to the `fixtures` directory

## Debugging Tests

Use the debug scripts in this directory for troubleshooting:

- `debug/test-debug.ts`: Basic debugging of the parser and formatter
- `debug/test-specific.ts`: Tests for specific features like optional fields
- `debug/test-tokens.ts`: Debugging token generation
- `debug/test-hanging.ts`: Tests for parser edge cases
- `debug/test-multiple.ts`: Tests for multiple type definitions
- `debug/test-demo-structure.ts`: Tests for the demo code structure



<!-- TEST_RESULTS_START -->
## Test Results

| Test Name | Status |
|-----------|--------|
| test\index.test.ts > Parse simple Lua code | ✅ Pass |
| test\index.test.ts > Parse Luau with type annotations | ✅ Pass |
| test\index.test.ts > Format Lua code | ✅ Pass |
| test\index.test.ts > Generate TypeScript types from Luau | ✅ Pass |
| test\index.test.ts > Analyze code with errors | ✅ Pass |
| test\index.test.ts > Complex Luau parsing | ✅ Pass |
| test\features.test.ts > Parse simple Lua code | ✅ Pass |
| test\features.test.ts > Format Lua code | ✅ Pass |
| test\features.test.ts > Analyze code with errors | ✅ Pass |
| test\features.test.ts > Parse Luau with type annotations | ✅ Pass |
| test\features.test.ts > Parse complex nested types | ✅ Pass |
| test\features.test.ts > Generate TypeScript interfaces from Luau | ✅ Pass |
| test\features.test.ts > Convert optional types | ✅ Pass |
| test\features.test.ts > Convert array types | ✅ Pass |
| test\features.test.ts > Convert record types | ✅ Pass |
| test\features.test.ts > Convert function types | ✅ Pass |
| test\features.test.ts > Convert method types | ✅ Pass |
| test\features.test.ts > Convert union types | ✅ Pass |
| test\features.test.ts > Preserve single-line comments | ❌ Fail |
| test\features.test.ts > Preserve multi-line comments | ❌ Fail |
| test\features.test.ts > Handle syntax errors | ❌ Fail |
| test\features.test.ts > Handle type errors | ✅ Pass |
| test\features.test.ts > Apply plugin transforms | ✅ Pass |
| test\types.test.ts > Convert nested complex types | ✅ Pass |
| test\types.test.ts > Convert array of custom types | ✅ Pass |
| test\types.test.ts > Convert optional nested types | ✅ Pass |
| test\types.test.ts > Convert union types with object literals | ❌ Fail |
| test\types.test.ts > Convert function with multiple parameters | ✅ Pass |
| test\types.test.ts > Handle recursive types | ✅ Pass |
| test\types.test.ts > Convert generic types | ✅ Pass |
| test\types.test.ts > Convert indexed access types | ✅ Pass |
| test\types.test.ts > Use unknown instead of any | ❌ Fail |
| test\types.test.ts > Prefix interface names | ❌ Fail |
| test\types.test.ts > Generate semicolons based on option | ❌ Fail |
| test\snapshots.test.ts > Basic types snapshot | ✅ Pass |
| test\snapshots.test.ts > Game types snapshot | ❌ Fail |
| test\plugins.test.ts > Plugin can transform types | ✅ Pass |
| test\plugins.test.ts > Can use plugin object directly | ✅ Pass |
| test\cli.test.ts > Convert a single file | ❌ Fail |
| test\cli.test.ts > Convert a directory | ❌ Fail |
| test\cli.test.ts > Validate a file | ❌ Fail |
| test\cli.test.ts > Use config file | ❌ Fail |
| **Total** | 30 / 42 passed |
<!-- TEST_RESULTS_END -->
