<div align="center">
  <img src="docs/assets/logo.png" alt="LuaTS Logo" width="300" />
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/luats.svg?style=flat-square)](https://www.npmjs.org/package/luats)
[![build status](https://img.shields.io/github/actions/workflow/status/codemeapixel/luats/test-build.yml?branch=master&style=flat-square)](https://github.com/codemeapixel/luats/actions)
[![npm downloads](https://img.shields.io/npm/dm/luats.svg?style=flat-square)](https://npm-stat.com/charts.html?package=luats)
[![license](https://img.shields.io/npm/l/luats.svg?style=flat-square)](https://github.com/codemeapixel/luats/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

</div>

<p align="center">
  <b>A TypeScript library for parsing, formatting, and providing type interfaces for Lua and Luau code.</b>
  <br>
  <a href="https://luats.lol"><strong>Explore the docs »</strong></a>
  <br>
  <br>
  <a href="https://luats.lol/examples">View Examples</a>
  ·
  <a href="https://github.com/codemeapixel/luats/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
  ·
  <a href="https://github.com/codemeapixel/luats/issues/new?labels=enhancement&template=feature_request.md">Request Feature</a>
  ·
  <a href="https://github.com/codemeapixel/luats/security/policy">Security</a>
</p>

## 🌟 What is LuaTS?

LuaTS bridges the gap between Lua/Luau and TypeScript ecosystems, allowing developers to leverage type safety while working with Lua codebases. Whether you're developing Roblox games, working with embedded Lua, or maintaining legacy Lua code, LuaTS helps you generate accurate TypeScript definitions for better IDE support, type checking, and developer experience.

> [!CAUTION]
> This lib is still a work in progress, as such you WILL NOT find it on NPM yet!

## ✨ Features

- 🔁 **Converts Lua/Luau type declarations into TypeScript interfaces**
- 🧠 **Maps Lua types to TypeScript equivalents** (`string`, `number`, etc.)
- ❓ **Supports optional types** (`foo: string?` → `foo?: string`)
- 🔧 **Handles table types** (`{string}` → `string[]` or `Record`)
- ➡️ **Converts Luau function types to arrow functions in TS**
- 📄 **Preserves comments and maps them to JSDoc format**
- 📁 **Supports single-file or batch directory conversion**
- 🛠 **Includes a CLI tool**:
  - `--out` / `-o` for output path
  - `--watch` for live file watching
  - `--silent` / `--verbose` modes
- 🧪 **Validates syntax and reports conversion errors**
- 🔌 **Optional config file** (`luats.config.json`)
- 🔄 **Merges overlapping types or handles shared structures**
- 📦 **Programmatic API** (`convertLuaToTS(code: string, options?)`)
- 🧩 **Plugin hook system for custom transforms** (planned)
- 🧠 **(Optional) Inference for inline tables to generate interfaces**
- 📜 **Fully typed** (written in TS) with exported definitions
- 🧪 **Test suite with snapshot/fixture testing**

## 📦 Installation

```bash
# Using npm
npm install luats

# Using yarn
yarn add luats

# Using bun
bun add luats
```

## 🚀 Quick Start

```typescript
import { LuaParser, LuaFormatter, TypeGenerator } from 'luats';

// Parse Lua code
const parser = new LuaParser();
const ast = parser.parse(`
  local function greet(name)
    return "Hello, " .. name
  end
`);

// Generate TypeScript from Luau types
const typeGen = new TypeGenerator();
const tsCode = typeGen.generateTypeScript(`
  type Vector3 = {
    x: number,
    y: number,
    z: number
  }
`);

console.log(tsCode);
// Output: interface Vector3 { x: number; y: number; z: number; }
```

## 💡 Use Cases

- **Roblox Development**: Generate TypeScript definitions from Luau types for better IDE support
- **Game Development**: Maintain type safety when interfacing with Lua-based game engines
- **Legacy Code Integration**: Add TypeScript types to existing Lua codebases
- **API Type Definitions**: Generate TypeScript types for Lua APIs
- **Development Tools**: Build better tooling for Lua/TypeScript interoperability

📚 **[Read the full documentation](https://luats.lol)** for comprehensive guides, API reference, and examples.

## 📖 Documentation

Visit **[luats.lol](https://luats.lol)** for comprehensive documentation including:

- [Getting Started Guide](https://luats.lol/getting-started)
- [API Reference](https://luats.lol/api-reference)
- [CLI Usage](https://luats.lol/cli)
- [Plugin System](https://luats.lol/plugins)
- [Examples](https://luats.lol/examples)
- [Contributing Guide](https://luats.lol/contributing)

## 🛠 CLI Usage

The CLI supports converting files and directories:

```bash
npx luats convert src/file.lua -o src/file.d.ts
npx luats dir src/lua -o src/types
```

### CLI Options

| Option         | Alias | Description                       |
| -------------- | ----- | --------------------------------- |
| --input        | -i    | Input file or directory           |
| --output       | -o    | Output file or directory          |
| --config       | -c    | Path to config file               |
| --silent       | -s    | Suppress output messages          |
| --verbose      | -v    | Verbose output                    |
| --watch        | -w    | Watch for file changes            |

### Configuration File

You can use a `luats.config.json` or `.luatsrc.json` file to specify options:

```json
{
  "outDir": "./types",
  "include": ["**/*.lua", "**/*.luau"],
  "exclude": ["**/node_modules/**", "**/dist/**"],
  "plugins": [],
  "typeGeneratorOptions": {
    "exportTypes": true,
    "generateComments": true
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [Contributing Guide](https://luats.lol/contributing) for more information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
