---
layout: default
title: Plugin System
nav_order: 5
---

# Plugin System
{: .no_toc }

LuaTS provides a plugin system that allows you to customize and extend the type generation process.
{: .fs-6 .fw-300 }

> **Tip:**  
> For generating Markdown documentation, see the [Markdown Generator](./api-reference.md#markdowngenerator).

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The plugin system allows you to hook into various stages of the type generation process, enabling customizations such as:

- Transforming Luau types to custom TypeScript types
- Modifying generated interfaces
- Pre-processing the AST before type generation
- Post-processing the generated TypeScript code

## Creating a Plugin

A plugin is a JavaScript or TypeScript module that exports an object conforming to the `Plugin` interface:

```typescript
import { Plugin } from 'luats';
import * as AST from 'luats/types';

const MyPlugin: Plugin = {
  name: 'MyPlugin',
  description: 'A custom plugin for LuaTS',
  
  // Optional hook to transform a type
  transformType: (luauType, tsType, options) => {
    // Modify the TypeScript type string
    if (tsType === 'number') {
      return 'CustomNumber';
    }
    return tsType;
  },
  
  // Optional hook to transform an interface
  transformInterface: (interfaceName, properties, options) => {
    // Add a common field to all interfaces
    properties.push({
      name: 'createdAt',
      type: 'string',
      optional: false,
      description: 'Creation timestamp'
    });
    
    return { name: interfaceName, properties };
  },
  
  // Optional hook for pre-processing the AST
  preProcess: (ast, options) => {
    // Modify the AST before type generation
    return ast;
  },
  
  // Optional hook for post-processing the generated code
  postProcess: (generatedCode, options) => {
    // Add a header comment to the generated code
    return `// Generated with MyPlugin\n${generatedCode}`;
  }
};

export default MyPlugin;
```

### Plugin Interface

The `Plugin` interface has the following structure:

```typescript
interface Plugin {
  name: string;
  description: string;
  
  transformType?: (
    type: AST.LuauType, 
    tsType: string, 
    options: PluginOptions
  ) => string;
  
  transformInterface?: (
    interfaceName: string, 
    properties: TypeScriptProperty[], 
    options: PluginOptions
  ) => { name: string, properties: TypeScriptProperty[] };
  
  preProcess?: (
    ast: AST.Program, 
    options: PluginOptions
  ) => AST.Program;
  
  postProcess?: (
    generatedCode: string, 
    options: PluginOptions
  ) => string;
}
```

### Plugin Hooks

Plugins can implement any combination of the following hooks:

| Hook | Description |
| --- | --- |
| `transformType` | Called for each Luau type being converted to TypeScript. |
| `transformInterface` | Called for each interface being generated. |
| `preProcess` | Called before type generation with the parsed AST. |
| `postProcess` | Called after code generation with the complete TypeScript code. |

## Using Plugins

### Programmatic Usage

You can use plugins programmatically with the `generateTypesWithPlugins` function:

```typescript
import { generateTypesWithPlugins } from 'luats';

const luauCode = `
  type Person = {
    name: string,
    age: number
  }
`;

// Method 1: Using plugin file paths
const generatedCode = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  ['./plugins/my-plugin.js', './plugins/another-plugin.js']
);

// Method 2: Using plugin objects directly (in-memory plugins)
import MyPlugin from './plugins/my-plugin.js';

const generatedCodeWithInlinePlugin = await generateTypesWithPlugins(
  luauCode,
  { useUnknown: true },
  [MyPlugin]
);
```

### With the TypeGenerator Class

You can also apply plugins directly to a `TypeGenerator` instance:

```typescript
import { TypeGenerator, LuauParser } from 'luats';
import { applyPlugins } from 'luats/plugins/plugin-system';
import MyPlugin from './plugins/my-plugin.js';

const parser = new LuauParser();
const generator = new TypeGenerator({ generateComments: true });
const ast = parser.parse(luauCode);

// Apply plugins
applyPlugins(generator, [MyPlugin], {
  typeGeneratorOptions: { generateComments: true },
  config: { preserveComments: true, commentStyle: 'jsdoc' }
});

// Generate TypeScript with plugins applied
const typesWithPlugins = generator.generateFromLuauAST(ast);
```

### Using the CLI

To use plugins with the CLI, specify them in your configuration file:

```json
{
  "plugins": [
    "./plugins/my-plugin.js",
    "./plugins/another-plugin.js"
  ],
  "typeGeneratorOptions": {
    "useUnknown": true
  }
}
```

Then run the CLI with the config file:

```bash
npx luats dir src/lua -o src/types --config luats.config.json
```

## Extending Plugins

Plugins can also be used to:
- Add custom JSDoc comments or annotations
- Transform or filter generated interfaces/types
- Integrate with documentation tools (e.g., MarkdownGenerator)
- Enforce project-specific conventions

## Plugin Examples

### ReadOnly Plugin

A plugin that makes all properties in generated interfaces readonly:

```typescript
// readonly-plugin.ts
import { Plugin } from 'luats';

const ReadonlyPlugin: Plugin = {
  name: 'ReadonlyPlugin',
  description: 'Makes all properties readonly',
  
  transformInterface: (interfaceName, properties, options) => {
    // Mark all properties as readonly
    properties.forEach(prop => {
      prop.readonly = true;
    });
    
    return { name: interfaceName, properties };
  }
};

export default ReadonlyPlugin;
```

### Comment Plugin

A plugin that enhances JSDoc comments:

```typescript
// comment-plugin.ts
import { Plugin } from 'luats';

const CommentPlugin: Plugin = {
  name: 'CommentPlugin',
  description: 'Enhances JSDoc comments',
  
  postProcess: (generatedCode, options) => {
    // Add file header
    return `/**
 * Generated TypeScript interfaces from Luau types
 * @generated
 * @date ${new Date().toISOString()}
 */
${generatedCode}`;
  }
};

export default CommentPlugin;
```

### Custom Type Transformer

A plugin that maps specific types to custom implementations:

```typescript
// type-mapper-plugin.ts
import { Plugin } from 'luats';

const TypeMapperPlugin: Plugin = {
  name: 'TypeMapperPlugin',
  description: 'Maps specific types to custom implementations',
  
  transformType: (luauType, tsType, options) => {
    // Custom type mappings
    const typeMap: Record<string, string> = {
      'number': 'NumericValue',
      'string': 'StringValue',
      'boolean': 'BooleanValue',
      'any': 'AnyValue'
    };
    
    return typeMap[tsType] || tsType;
  }
};

export default TypeMapperPlugin;
```

## Loading Plugins

LuaTS provides a utility function to load plugins from file paths:

```typescript
import { loadPlugins } from 'luats/plugins/plugin-system';

async function loadMyPlugins() {
  const plugins = await loadPlugins([
    './plugins/my-plugin.js',
    './plugins/another-plugin.js'
  ]);
  
  console.log(`Loaded ${plugins.length} plugins`);
  return plugins;
}
```

## Plugin Options

The plugin hooks receive an options object with the following structure:

```typescript
interface PluginOptions {
  typeGeneratorOptions: TypeGeneratorOptions;
  config: LuatsConfig;
}
```

This provides access to both the TypeGenerator options and the global LuaTS configuration.
