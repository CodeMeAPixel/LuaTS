---
layout: home
title: Home
nav_order: 1
permalink: /
---

# LuaTS
{: .fs-9 }

A TypeScript library for parsing, formatting, and providing type interfaces for Lua and Luau code.
{: .fs-6 .fw-300 }

[Get Started](./getting-started){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/codemeapixel/luats){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Overview

LuaTS is a powerful library for converting Lua/Luau type annotations into TypeScript interfaces. It provides robust tooling for developers working with Lua/Luau code in TypeScript environments.

## Features

- 🔁 **Converts Lua/Luau type declarations into TypeScript interfaces**
- 🧠 **Maps Lua types to TypeScript equivalents** (`string`, `number`, etc.)
- ❓ **Supports optional types** (`foo: string?` → `foo?: string`)
- 🔧 **Handles table types** (`{string}` → `string[]` or `Record`)
- ➡️ **Converts Luau function types to arrow functions in TS**
- 📄 **Preserves comments and maps them to JSDoc format**
- 📁 **Supports single-file or batch directory conversion**
- 🛠 **Includes a CLI tool** with various options
- 🧪 **Validates syntax and reports conversion errors**
- 🔌 **Optional config file** (`luats.config.json`)
- 🔄 **Merges overlapping types or handles shared structures**
- 📦 **Programmatic API** with comprehensive options
- 🧩 **Plugin hook system for custom transforms**
- 🧠 **Optional inference for inline tables**
- 📜 **Fully typed** (written in TypeScript)

## Quick Example

```typescript
import { generateTypes } from 'luats';

const tsCode = generateTypes(`
  type Vector3 = {
    x: number,
    y: number,
    z: number
  }
`);

console.log(tsCode);
// Output:
// interface Vector3 {
//   x: number;
//   y: number;
//   z: number;
// }
```

## Test & Coverage Reporting

LuaTS supports Bun's built-in test runner. For coverage, run:

```bash
bun test --coverage
```

This generates `test/lcov.info` for coverage reporting.  
For test pass/fail reporting, use the CLI output or a compatible reporter.

## License

LuaTS is distributed under the [MIT license](https://github.com/codemeapixel/luats/blob/main/LICENSE).
