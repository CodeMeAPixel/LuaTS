# Luats Test Suite

This directory contains the comprehensive test suite for the Luats library. The tests ensure that all the features listed in the main README are working correctly.

## Test Structure

- **index.test.ts**: Core functionality tests
- **features.test.ts**: Feature-specific tests covering all major functionality
- **types.test.ts**: Advanced type conversion tests
- **cli.test.ts**: CLI tool tests
- **plugins.test.ts**: Plugin system tests
- **snapshots.test.ts**: Snapshot testing for type generation

## Test Status

<!-- TEST_RESULTS_START -->
- ✅ **Passing:** Most core and feature tests
- ❌ **Failing:** See [FAILING_TESTS.md](../FAILING_TESTS.md) for details on failing and incomplete tests.
<!-- TEST_RESULTS_END -->

## Test Coverage

The test suite aims to provide comprehensive coverage of the Luats codebase. You can run the tests with coverage reports using:

```bash
bun test --coverage
```

After running tests, coverage is reported in `test/lcov.info`.  
You can use [coverage tools](https://github.com/bcoe/nyc) to visualize this file.

## Failing and Passing Tests

See [FAILING_TESTS.md](../FAILING_TESTS.md) for a checklist of failing and passing tests, including known issues and incomplete features.

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
