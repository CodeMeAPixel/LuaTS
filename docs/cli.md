---
layout: default
title: CLI
nav_order: 4
---

# CLI Tool
{: .no_toc }

LuaTS includes a powerful command-line interface for converting Lua/Luau files to TypeScript.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

The CLI is included with the LuaTS package:

```bash
# Global installation (optional)
npm install -g luats

# Or use npx without global installation
npx luats ...
```

## Basic Commands

LuaTS CLI has two main commands:

1. `convert` - Convert a single file
2. `dir` - Convert all files in a directory

### Convert a Single File

```bash
npx luats convert path/to/file.lua -o path/to/output.ts
```

### Convert a Directory

```bash
npx luats dir src/lua -o src/types
```

## Command Options

### Global Options

These options apply to all commands:

| Option | Alias | Description |
| --- | --- | --- |
| `--version` | `-V` | Output the version number |
| `--help` | `-h` | Display help information |

### Convert Command Options

| Option | Alias | Description |
| --- | --- | --- |
| `--out <path>` | `-o` | Output file path |
| `--config <path>` | `-c` | Path to config file |
| `--silent` | `-s` | Suppress output messages |
| `--verbose` | `-v` | Show detailed log information |

### Directory Command Options

| Option | Alias | Description |
| --- | --- | --- |
| `--out <path>` | `-o` | Output directory path |
| `--config <path>` | `-c` | Path to config file |
| `--silent` | `-s` | Suppress output messages |
| `--verbose` | `-v` | Show detailed log information |
| `--recursive` | `-r` | Process directories recursively |
| `--pattern <glob>` | `-p` | File glob pattern (default: "**/*.{lua,luau}") |
| `--watch` | `-w` | Watch for file changes |

## Examples

### Basic Conversion

Convert a single Lua file to TypeScript:

```bash
npx luats convert src/player.lua -o src/player.d.ts
```

### Directory Conversion

Convert all Lua files in a directory:

```bash
npx luats dir src/lua -o src/types
```

### Watch Mode

Automatically convert files when they change:

```bash
npx luats dir src/lua -o src/types --watch
```

### Custom Pattern

Only convert files matching a specific pattern:

```bash
npx luats dir src -o types --pattern "**/*.luau"
```

### Using a Config File

Use a configuration file for consistent options:

```bash
npx luats dir src -o types --config luats.config.json
```

## Configuration File

You can use a configuration file to specify options for the CLI. The file can be in JSON format and should be named `luats.config.json` (default) or `.luatsrc.json`.

Example configuration file:

```json
{
  "outDir": "./types",
  "include": ["**/*.lua", "**/*.luau"],
  "exclude": ["**/node_modules/**", "**/dist/**"],
  "preserveDirectoryStructure": true,
  "plugins": ["./plugins/my-plugin.js"],
  "preserveComments": true,
  "commentStyle": "jsdoc",
  "inferTypes": false,
  "mergeInterfaces": true,
  "typeGeneratorOptions": {
    "useUnknown": true,
    "exportTypes": true,
    "useReadonly": false,
    "generateComments": true,
    "arrayType": "auto",
    "preserveTableIndexSignatures": true,
    "functionStyle": "arrow",
    "indentSpaces": 2,
    "singleQuote": true,
    "trailingComma": false
  }
}
```

## Error Handling

The CLI provides helpful error messages for common issues:

- Syntax errors in Lua/Luau files
- File not found errors
- Permission issues
- Configuration errors

For detailed error information, use the `--verbose` flag:

```bash
npx luats convert file.lua -o file.d.ts --verbose
```

## Exit Codes

| Code | Description |
| --- | --- |
| 0 | Success |
| 1 | Error (file not found, parse error, etc.) |

## Integrating with Build Tools

### npm scripts

You can add LuaTS to your build process using npm scripts:

```json
{
  "scripts": {
    "build:types": "luats dir src/lua -o src/types",
    "watch:types": "luats dir src/lua -o src/types --watch",
    "prebuild": "npm run build:types"
  }
}
```

### GitHub Actions

Example GitHub Action workflow:

```yaml
name: Generate TypeScript Definitions

on:
  push:
    paths:
      - '**/*.lua'
      - '**/*.luau'

jobs:
  generate-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g luats
      - run: luats dir src/lua -o src/types
      - name: Commit changes
        uses: EndBug/add-and-commit@v7
        with:
          message: 'Update TypeScript definitions'
          add: 'src/types'
```
