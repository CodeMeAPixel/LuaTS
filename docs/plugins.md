---
layout: default
title: Plugin System
nav_order: 5
---

# Plugin System
{: .no_toc }

LuaTS provides a comprehensive plugin system that allows you to customize and extend the type generation process.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The plugin system allows you to hook into various stages of the type generation process, enabling customizations such as:

- **Type Transformation**: Convert Luau types to custom TypeScript types
- **Interface Modification**: Add, remove, or modify generated interface properties  
- **Code Post-Processing**: Transform the final generated TypeScript code
- **AST Pre-Processing**: Modify the parsed AST before type generation

## Plugin Interface

A plugin is an object that conforms to the `Plugin` interface:

```typescript
interface Plugin {
  name: string;
  description: string;
  version?: string;
  
  // Optional transformation hooks
  transformType?: (luauType: string, tsType: string, options?: any) => string;
  transformInterface?: (
    name: string, 
    properties: any[], 
    options?: any
  ) => { name: string; properties: any[] };
  process?: (ast: any, options: any) => any;
  postProcess?: (generatedCode: string, options: any) => string;
}
```

### Plugin Hooks

| Hook | When Called | Purpose |
|------|-------------|---------|
| `transformType` | For each type conversion | Transform individual Luau types to TypeScript |
| `transformInterface` | For each generated interface | Modify interface structure and properties |
| `process` | Before type generation | Pre-process the parsed AST |
| `postProcess` | After code generation | Transform the final TypeScript output |

## Creating Plugins

### TypeScript Plugin

```typescript
// readonly-plugin.ts
import { Plugin } from 'luats';

const ReadonlyPlugin: Plugin = {
  name: 'ReadonlyPlugin',
  description: 'Makes all interface properties readonly',
  version: '1.0.0',
  
  postProcess: (generatedCode, options) => {
    // Add readonly modifiers to all properties
    const readonlyCode = generatedCode.replace(
      /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)([\?]?):\s*(.+);$/gm,
      '$1readonly $2$3: $4;'
    );
    
    return `// Generated with ReadonlyPlugin v1.0.0\n${readonlyCode}`;
  }
};

export default ReadonlyPlugin;
```

### JavaScript Plugin

```javascript
// custom-number-plugin.js
module.exports = {
  name: 'CustomNumberPlugin',
  description: 'Transforms number types to CustomNumber',
  version: '1.0.0',
  
  transformType: (luauType, tsType, options) => {
    if (luauType === 'NumberType' && tsType === 'number') {
      return 'CustomNumber';
    }
    return tsType;
  },
  
  postProcess: (generatedCode, options) => {
    // Add CustomNumber type definition
    const customNumberDef = 'type CustomNumber = number & { __brand: "CustomNumber" };\n\n';
    return customNumberDef + generatedCode;
  }
};
```

## Using Plugins

### Programmatic Usage

```typescript
import { generateTypesWithPlugins } from 'luats';
import ReadonlyPlugin from './plugins/readonly-plugin';

const luauCode = `
  type User = {
    id: number,
    name: string,
    email?: string
  }
`;

// Method 1: Using plugin objects
const result1 = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  [ReadonlyPlugin]
);

// Method 2: Using plugin file paths
const result2 = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  ['./plugins/custom-number-plugin.js']
);

// Method 3: Mixed approach
const result3 = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  [ReadonlyPlugin, './plugins/custom-number-plugin.js']
);
```

### CLI Usage

Add plugins to your configuration file:

```json
{
  "outDir": "./types",
  "include": ["**/*.lua", "**/*.luau"],
  "plugins": [
    "./plugins/readonly-plugin.js",
    "./plugins/custom-number-plugin.js"
  ],
  "typeGeneratorOptions": {
    "useUnknown": true,
    "includeSemicolons": true
  }
}
```

Then run the CLI:

```bash
npx luats convert-dir src/lua -o src/types --config luats.config.json
```

### Plugin-Aware Generator

For advanced use cases, use the `PluginAwareTypeGenerator` directly:

```typescript
import { createPluginAwareGenerator } from 'luats/plugins/plugin-system';
import ReadonlyPlugin from './plugins/readonly-plugin';

const generator = createPluginAwareGenerator({
  useUnknown: true,
  includeSemicolons: true
});

// Add plugins
generator.addPlugin(ReadonlyPlugin);

// Generate with plugins applied
const result = generator.generateTypeScript(luauCode);
```

## Plugin Examples

### Type Mapper Plugin

Map specific Luau types to custom TypeScript types:

```typescript
const TypeMapperPlugin: Plugin = {
  name: 'TypeMapperPlugin',
  description: 'Maps specific types to custom implementations',
  
  transformType: (luauType, tsType, options) => {
    const typeMap: Record<string, string> = {
      'NumberType': 'SafeNumber',
      'StringType': 'SafeString',
      'BooleanType': 'SafeBoolean'
    };
    
    return typeMap[luauType] || tsType;
  },
  
  postProcess: (code, options) => {
    // Add safe type definitions
    const safeDefs = `
type SafeNumber = number & { __safe: 'number' };
type SafeString = string & { __safe: 'string' };  
type SafeBoolean = boolean & { __safe: 'boolean' };

`;
    return safeDefs + code;
  }
};
```

### Interface Enhancement Plugin

Add common properties to all interfaces:

```typescript
const EnhancementPlugin: Plugin = {
  name: 'EnhancementPlugin',
  description: 'Adds common properties to all interfaces',
  
  transformInterface: (name, properties, options) => {
    // Add metadata property to all interfaces
    const enhancedProperties = [...properties, {
      name: '__metadata',
      type: 'Record<string, unknown>',
      optional: true,
      description: 'Runtime metadata'
    }];
    
    return { name, properties: enhancedProperties };
  }
};
```

### Documentation Plugin

Add rich JSDoc comments:

```typescript
const DocumentationPlugin: Plugin = {
  name: 'DocumentationPlugin',
  description: 'Enhances generated code with documentation',
  
  postProcess: (code, options) => {
    const header = `/**
 * Generated TypeScript definitions from Luau types
 * @generated ${new Date().toISOString()}
 * @description This file contains auto-generated type definitions
 */

`;
    
    // Enhance interface documentation
    const documentedCode = code.replace(
      /interface (\w+) \{/g, 
      '/**\n * $1 interface\n */\ninterface $1 {'
    );
    
    return header + documentedCode;
  }
};
```

## Plugin Loading

### From Files

```typescript
import { loadPlugin, loadPlugins } from 'luats/plugins/plugin-system';

// Load single plugin
const plugin = await loadPlugin('./my-plugin.js');

// Load multiple plugins
const plugins = await loadPlugins([
  './plugin1.js',
  './plugin2.js',
  './plugin3.js'
]);
```

### From Directory

```typescript
import { loadPluginsFromDirectory } from 'luats/plugins/plugin-system';

const plugins = await loadPluginsFromDirectory('./plugins');
console.log(`Loaded ${plugins.length} plugins`);
```

### Plugin Validation

```typescript
import { validatePlugin } from 'luats/plugins/plugin-system';

const isValid = validatePlugin(somePluginObject);
if (!isValid) {
  console.error('Invalid plugin structure');
}
```

## Plugin Registry

Manage multiple plugins with the registry:

```typescript
import { PluginRegistry } from 'luats/plugins/plugin-system';

const registry = new PluginRegistry();

// Register plugins
registry.register(ReadonlyPlugin);
registry.register(TypeMapperPlugin);

// Get all plugins
const allPlugins = registry.getAll();

// Get specific plugin
const plugin = registry.get('ReadonlyPlugin');

// Remove plugin
registry.remove('ReadonlyPlugin');
```

## Best Practices

### Plugin Development

1. **Always include name and description**
2. **Use semantic versioning for versions**
3. **Handle edge cases gracefully**
4. **Provide meaningful error messages**
5. **Test plugins with various input scenarios**

### Performance

1. **Keep transformations lightweight**
2. **Cache expensive operations**
3. **Use early returns when possible**
4. **Avoid deep object mutations**

### Compatibility

1. **Test with different TypeGenerator options**
2. **Handle both CommonJS and ESM exports**
3. **Provide fallback behavior for errors**
4. **Document plugin requirements**

## Plugin Ecosystem

LuaTS plugins can be shared and distributed:

```json
{
  "name": "luats-plugin-readonly",
  "version": "1.0.0",
  "main": "dist/index.js",
  "keywords": ["luats", "plugin", "readonly", "typescript"],
  "peerDependencies": {
    "luats": "^0.1.0"
  }
}
```

This enables a rich ecosystem of community plugins for specialized use cases.
