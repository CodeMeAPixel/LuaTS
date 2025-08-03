---
layout: default
title: Parsers
parent: API Reference
nav_order: 3
---

# Parsers

This guide provides comprehensive information about the LuaTS parsers and their usage.

## Parser Overview

LuaTS includes two main parsers:

1. **Lua Parser** (`parsers/lua.ts`)
   - Parses standard Lua syntax
   - Supports Lua 5.4 features
   - Handles Lua-specific constructs

2. **Luau Parser** (`parsers/luau.ts`)
   - Parses Luau (Roblox) syntax
   - Supports Luau type annotations
   - Handles Luau-specific features

## Parser Features

### Lua Parser

```typescript
// Lua-specific features

// Table constructors
{
  key = value,
  [key] = value,
  value
}

// Function definitions
function foo() end

// Local function declarations
local function bar() end

// Multiple return values
local a, b = func()

// Vararg
function foo(...)
  local args = {...}
end
```

### Luau Parser

```typescript
// Luau-specific features

// Type annotations
local x: number = 5

// Table types
local t: {string} = {}

// Function types
local f: (number) -> string = function(x)
  return tostring(x)
end

// Union types
local value: string | number = "hello"

// Intersection types
local user: Base & {name: string} = {}
```

## Error Handling

### Syntax Errors

```typescript
// Invalid syntax
local x = { -- Missing closing brace

// Error message:
// Syntax error: expected '}' near end of file
```

### Type Errors

```typescript
// Invalid type annotation
local x: invalid_type = 5

// Error message:
// Unknown type 'invalid_type'
```

### Recovery

```typescript
// Parser attempts to recover from errors
local x = { -- Missing closing brace
local y = 5 -- Still processes this line
```

## Performance Considerations

### Memory Usage

```typescript
// Large files
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

// Deep recursion
const MAX_DEPTH = 1000;
```

### Optimization

```typescript
// Use batch processing
const BATCH_SIZE = 100;

// Use streaming for large files
const CHUNK_SIZE = 64 * 1024; // 64KB
```

## Best Practices

### Code Organization

```typescript
// Separate type definitions
local types = {
  Vector2 = {
    x: number,
    y: number
  }
}

// Separate implementation
local impl = {
  createVector2 = function(x: number, y: number): Vector2
    return { x = x, y = y }
  end
}
```

### Type Safety

```typescript
// Use type guards
local function isVector2(value: any): boolean
  return type(value) == "table" and
         type(value.x) == "number" and
         type(value.y) == "number"
end

// Use type assertions
local function getVector2(value: any): Vector2
  assert(isVector2(value))
  return value
end
```

### Error Handling

```typescript
// Handle parse errors
try
  local ast = parseLua(code)
catch
  error("Failed to parse Lua code")
end

// Handle type errors
try
  local ts = generateTypes(ast)
catch
  error("Failed to generate TypeScript")
end
```

## Troubleshooting

### Common Issues

1. **Syntax Errors**
   ```typescript
   // Missing semicolons
   local x = 5
   local y = 10 -- Error: expected ';' before 'local'
   ```

2. **Type Errors**
   ```typescript
   // Invalid type inference
   local x = "hello" -- Inferred as string
   local y: number = x -- Error: string is not assignable to number
   ```

3. **Performance Issues**
   ```typescript
   // Large AST nodes
   local t = {
     -- 1000+ properties
   } -- Error: too many AST nodes
   ```

## Advanced Usage

### Custom Parsers

```typescript
// Create a custom parser
local function parseCustom(code: string)
  local ast = parseLua(code)
  -- Add custom transformations
  return ast
end

// Use with LuaTS
local ts = generateTypes(parseCustom(code))
```

### Parser Extensions

```typescript
// Extend the parser
local function extendParser(parser: Parser)
  parser:addRule("customType", function()
    -- Custom parsing logic
  end)
  return parser
end

// Use extended parser
local ts = generateTypes(extendParser(parseLua(code)))
```

## Best Practices for Large Projects

1. **Modularization**
   ```typescript
   -- Separate type definitions
   local types = require("types")
   -- Separate implementation
   local impl = require("impl")
   ```

2. **Type Safety**
   ```typescript
   -- Use strict type checking
   local strict = true
   -- Use type guards
   local function isType(value: any): boolean
     return strict and type(value) == "table"
   end
   ```

3. **Error Handling**
   ```typescript
   -- Use try-catch blocks
   try
     local ast = parseLua(code)
   catch
     error("Failed to parse code")
   end
   ```

4. **Performance Optimization**
   ```typescript
   -- Use batch processing
   local BATCH_SIZE = 100
   -- Use streaming
   local CHUNK_SIZE = 64 * 1024
   ```
