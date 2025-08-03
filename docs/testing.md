---
layout: default
title: Testing
nav_order: 7
---

# Testing Guide

This guide provides comprehensive information about testing LuaTS and writing tests for your Lua/Luau code.

## Test Structure

The test suite is organized into several key components:

### Test Files

- `all.test.ts`: Entry point for all tests
- `cli.test.ts`: Tests for CLI functionality
- `features.test.ts`: Comprehensive feature tests
- `index.test.ts`: Core functionality tests
- `plugins.test.ts`: Plugin system tests
- `snapshots.test.ts`: Snapshot tests
- `types.test.ts`: Type system tests
- `utils-test.ts`: Utility function tests

### Fixtures

The `fixtures` directory contains test data and examples:

- `lua`: Lua test files
- `luau`: Luau test files

### Snapshots

The `snapshots` directory contains:

- `cli`: CLI output snapshots
- `features`: Feature test snapshots
- `plugins`: Plugin output snapshots
- `types`: Type conversion snapshots

## Writing Tests

### Basic Test Structure

```typescript
import { expect } from 'chai';
import { generateTypes } from '../src';

describe('Type Generation', () => {
  it('should convert basic types', () => {
    const luaCode = `type Vector2 = { x: number, y: number }`;
    const tsCode = generateTypes(luaCode);
    expect(tsCode).to.include('interface Vector2');
  });
});
```

### Snapshot Testing

```typescript
import { expect } from 'chai';
import { generateTypes } from '../src';
import { snapshot } from './utils-test';

describe('Type Generation Snapshots', () => {
  it('should match complex type conversion', () => {
    const luaCode = `type Complex = { [key: string]: { value: any, metadata: { created: number } } }`;
    const tsCode = generateTypes(luaCode);
    snapshot('complex-type', tsCode);
  });
});
```

### Error Handling Tests

```typescript
import { expect } from 'chai';
import { generateTypes } from '../src';

describe('Error Handling', () => {
  it('should throw on invalid type', () => {
    const luaCode = `type Invalid = { invalid: syntax }`;
    expect(() => generateTypes(luaCode)).to.throw('Syntax error');
  });
});
```

## Test Commands

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test test/features.test.ts

# Run tests with coverage
npm run test:coverage
```

### Updating Snapshots

```bash
# Update all snapshots
npm run test:update

# Update specific snapshot
npm run test:update test/snapshots.test.ts
```

## Best Practices

1. **Test Coverage**
   - Test all type conversions
   - Test edge cases
   - Test error handling
   - Test performance-critical paths

2. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Include test data in fixtures
   - Use snapshots for complex outputs

3. **Test Performance**
   - Use mock data for large inputs
   - Test with real-world examples
   - Measure performance impact
   - Test memory usage

## Troubleshooting

### Common Test Failures

1. **Type Mismatch**
   ```typescript
   // Expected: interface Vector2 { x: number; y: number; }
   // Received: interface Vector2 { x: any; y: any; }
   ```
   - Check type inference logic
   - Verify AST parsing
   - Review type mapping rules

2. **Snapshot Mismatch**
   ```typescript
   // Expected: interface User { id: string; name: string; }
   // Received: interface User { id: string; name: string; age?: number; }
   ```
   - Review source code changes
   - Update snapshots if intentional
   - Check for unintended changes

3. **Performance Issues**
   ```typescript
   // Test timed out after 5000ms
   ```
   - Optimize parsing logic
   - Use batch processing
   - Implement caching
   - Review memory usage

## Contributing to Tests

1. **Adding New Tests**
   - Create test file in appropriate directory
   - Add test data to fixtures
   - Write comprehensive test cases
   - Include performance benchmarks

2. **Updating Existing Tests**
   - Update test data in fixtures
   - Update snapshots if needed
   - Verify test coverage
   - Review performance impact

3. **Performance Testing**
   - Add benchmark tests
   - Measure memory usage
   - Test with large inputs
   - Verify edge cases
