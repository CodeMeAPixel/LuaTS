---
layout: default
title: CLI Advanced Usage
parent: CLI
nav_order: 2
---

# CLI Advanced Usage

This guide provides advanced usage patterns and configuration options for the LuaTS CLI.

## Configuration Options

### Type Generator Options

```typescript
interface TypeGeneratorOptions {
  // Whether to use 'unknown' type instead of 'any'
  useUnknown?: boolean;
  
  // Prefix to add to generated interfaces
  interfacePrefix?: string;
  
  // Whether to add semicolons to generated code
  semicolons?: boolean;
  
  // Whether to preserve comments from source
  preserveComments?: boolean;
  
  // Whether to generate comments in output
  generateComments?: boolean;
  
  // Style of comments to generate
  commentStyle?: 'jsdoc' | 'regular';
}
```

### File Processing

```typescript
// Process a single file
luats convert src/player.lua -o src/types/player.ts

// Process a directory with custom pattern
luats dir src/lua --pattern "**/*.luau" -o src/types

// Exclude specific files
luats dir src/lua --exclude "**/node_modules/**" -o src/types
```

### Watch Mode

```bash
# Watch for changes in a directory
luats dir src/lua -o src/types --watch

# Watch with verbose output
luats dir src/lua -o src/types --watch --verbose
```

## Performance Considerations

### Batch Processing

```bash
# Process files in batches
luats dir src/lua -o src/types --batch-size 100
```

### Memory Management

```bash
# Use memory optimization
luats dir src/lua -o src/types --optimize-memory
```

## Error Handling

### Error Recovery

```bash
# Continue processing on error
luats dir src/lua -o src/types --continue-on-error

# Log errors to file
luats dir src/lua -o src/types --error-log errors.log
```

## Plugin Integration

### Using Plugins

```bash
# Use a plugin
luats convert src/player.lua -o src/types/player.ts --plugin readonly

# Use multiple plugins
luats convert src/player.lua -o src/types/player.ts --plugin readonly --plugin optimize
```

### Plugin Configuration

```typescript
// Create a plugin config file (plugins.json)
{
  "plugins": [
    {
      "name": "readonly",
      "options": {
        "strict": true
      }
    },
    {
      "name": "optimize",
      "options": {
        "minify": true
      }
    }
  ]
}
```

```bash
# Use plugin config file
luats convert src/player.lua -o src/types/player.ts --plugin-config plugins.json
```

## Advanced Features

### Custom Type Mapping

```typescript
// Create a custom type mapping file (types.json)
{
  "mappings": {
    "Vector2": {
      "type": "imported",
      "path": "@types/vector2"
    },
    "Player": {
      "type": "custom",
      "interface": {
        "id": "string",
        "name": "string",
        "position": "Vector2"
      }
    }
  }
}
```

```bash
# Use custom type mapping
luats convert src/player.lua -o src/types/player.ts --type-mapping types.json
```

### Code Generation Hooks

```typescript
// Create a hook file (hooks.ts)
export const preProcess = (code: string) => {
  // Add imports
  return `import { Vector2 } from '@types/vector2';\n${code}`;
};

export const postProcess = (code: string) => {
  // Add exports
  return `export { ${code} }`;
};
```

```bash
# Use code generation hooks
luats convert src/player.lua -o src/types/player.ts --hooks hooks.ts
```

## Troubleshooting

### Common Issues

1. **Type Conversion Errors**
   ```bash
   # Add type hints
   luats convert src/player.lua -o src/types/player.ts --add-type-hints
   ```

2. **Performance Issues**
   ```bash
   # Use memory optimization
   luats dir src/lua -o src/types --optimize-memory
   ```

3. **Plugin Errors**
   ```bash
   # Check plugin compatibility
   luats check-plugin my-plugin
   ```

## Best Practices

1. **Configuration Management**
   ```typescript
   // Create a config file (luats.config.json)
   {
     "typeGenerator": {
       "useUnknown": true,
       "preserveComments": true
     },
     "plugins": [
       "readonly",
       "optimize"
     ]
   }
   ```

2. **Error Handling**
   ```bash
   # Always use --continue-on-error in production
   luats dir src/lua -o src/types --continue-on-error
   ```

3. **Performance Optimization**
   ```bash
   # Use batch processing for large directories
   luats dir src/lua -o src/types --batch-size 100
   ```

4. **Type Safety**
   ```bash
   # Use strict type checking
   luats convert src/player.lua -o src/types/player.ts --strict-types
   ```
