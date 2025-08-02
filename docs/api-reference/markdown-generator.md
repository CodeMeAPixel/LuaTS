---
layout: default
title: Markdown Generator
parent: API Reference
nav_order: 2
---

# MarkdownGenerator API

The `MarkdownGenerator` class generates Markdown documentation from a parsed API/type definition object, such as the output of your Lua/Luau parser or a custom API description.

---

## Installation

The Markdown generator is included in LuaTS. Import it as follows:

```typescript
import { MarkdownGenerator } from 'luats/dist/generators/markdown/generator';
```

---

## Usage

### Basic Example

```typescript
import { MarkdownGenerator } from 'luats/dist/generators/markdown/generator';

const apiObject = {
  name: "My API",
  description: "This is an example API.",
  functions: [
    {
      name: "foo",
      description: "Does foo things.",
      signature: "function foo(bar: string): number",
      parameters: [
        { name: "bar", type: "string", description: "The bar argument." }
      ],
      returns: { type: "number", description: "The result." }
    }
  ],
  types: [
    {
      name: "FooType",
      description: "A type for foo.",
      definition: "type FooType = { bar: string }"
    }
  ],
  examples: [
    {
      title: "Basic usage",
      description: "How to use foo.",
      code: "foo('hello')"
    }
  ]
};

const generator = new MarkdownGenerator({ title: "API Reference" });
const markdown = generator.generate(apiObject);

console.log(markdown);
```

---

## Options

| Option           | Type      | Description                                                      |
|------------------|-----------|------------------------------------------------------------------|
| `title`          | `string`  | Title for the generated Markdown (overrides `api.name`)          |
| `description`    | `string`  | Description for the Markdown (overrides `api.description`)       |
| `includeTypes`   | `boolean` | Whether to include the Types section (default: `true`)           |
| `includeExamples`| `boolean` | Whether to include the Examples section (default: `true`)        |

---

## API Object Structure

- `name`: (string) Name of the API/module.
- `description`: (string) Description of the API/module.
- `functions`: (array) List of function objects.
  - `name`: (string) Function name.
  - `description`: (string) Function description.
  - `signature`: (string, optional) Function signature (if omitted, generated from parameters).
  - `parameters`: (array) List of parameter objects:
    - `name`: (string) Parameter name.
    - `type`: (string) Parameter type.
    - `description`: (string, optional) Parameter description.
  - `returns`: (object, optional)
    - `type`: (string) Return type.
    - `description`: (string, optional) Return description.
- `types`: (array) List of type objects.
  - `name`: (string) Type name.
  - `description`: (string, optional) Type description.
  - `definition`: (string) Type definition (as Lua/Luau code).
- `examples`: (array) List of example objects.
  - `title`: (string, optional) Example title.
  - `description`: (string, optional) Example description.
  - `code`: (string) Example code (Lua/Luau).

---

## Output Format

The generated Markdown includes:

- Title and description
- Table of Contents
- Functions section (with signatures, parameters, and return types)
- Types section (with code blocks)
- Examples section (with code blocks)

---

## Advanced

- You can customize the API object structure to fit your needs, as long as you provide the required fields.
- The generator is designed to work with the output of the LuaTS parser, but you can use it with any compatible object.

---

## See Also

- [Type Generator](./type-generator.md)
- [API Reference](../api-reference.md)
