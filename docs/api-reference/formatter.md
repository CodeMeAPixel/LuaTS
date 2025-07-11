---
layout: default
title: Formatter
parent: API Reference
nav_order: 3
---

# Formatter
{: .no_toc }

The `LuaFormatter` class provides functionality to format Lua/Luau ASTs back into properly formatted code.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Overview

The formatter converts an abstract syntax tree (AST) back into Lua/Luau code with consistent formatting. It supports various style options such as indentation, spacing, and line length.

## Usage

```typescript
import { LuaParser, LuaFormatter } from 'luats';
// or
import { LuaFormatter } from 'luats/clients/formatter';

// Parse code into an AST
const parser = new LuaParser();
const ast = parser.parse(`
local function greet(name)
return "Hello, "..name
end
`);

// Format the AST with custom options
const formatter = new LuaFormatter({
  indentSize: 4,
  insertSpaceAfterComma: true,
  insertSpaceAroundOperators: true,
});

const formattedCode = formatter.format(ast);
console.log(formattedCode);
// Output:
// local function greet(name)
//     return "Hello, " .. name
// end
```

## FormatterOptions

The `LuaFormatter` constructor accepts an options object with the following properties:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `indentSize` | number | `2` | Number of spaces for indentation |
| `useTabs` | boolean | `false` | Use tabs instead of spaces for indentation |
| `maxLineLength` | number | `80` | Maximum characters per line |
| `insertFinalNewline` | boolean | `true` | Add a newline at the end of the file |
| `trimTrailingWhitespace` | boolean | `true` | Remove trailing whitespace |
| `insertSpaceAfterComma` | boolean | `true` | Add space after commas |
| `insertSpaceAroundOperators` | boolean | `true` | Add spaces around operators |
| `insertSpaceAfterKeywords` | boolean | `true` | Add space after keywords |

You can get the default options with:

```typescript
import { defaultFormatterOptions } from 'luats';
// or
import { defaultFormatterOptions } from 'luats/clients/formatter';

console.log(defaultFormatterOptions);
```

## Methods

| Method | Description |
| --- | --- |
| `constructor(options?: Partial<FormatterOptions>)` | Creates a new LuaFormatter instance with optional custom options. |
| `format(ast: AST.Program): string` | Formats an AST and returns the formatted code. |

## Formatting Examples

Here are examples of how the formatter transforms different code constructs:

### Function Declarations

```lua
-- Input AST represents:
function test(a,b,c)
return a+b*c
end

-- Formatted output:
function test(a, b, c)
  return a + b * c
end
```

### Tables

```lua
-- Input AST represents:
local t={foo="bar",baz=123,["key with space"]=true}

-- Formatted output:
local t = {
  foo = "bar",
  baz = 123,
  ["key with space"] = true
}
```

### Control Structures

```lua
-- Input AST represents:
if x>10 then print("big")elseif x>5 then print("medium")else print("small")end

-- Formatted output:
if x > 10 then
  print("big")
elseif x > 5 then
  print("medium")
else
  print("small")
end
```

## Convenience Functions

LuaTS also provides convenience functions for quick formatting:

```typescript
import { parseLua, formatLua } from 'luats';

// Parse and format in one step
const code = `
local x=10
if x>5 then return true end
`;

const formatted = formatLua(parseLua(code));
console.log(formatted);
```

## Style Guide Compliance

The formatter aims to follow common Lua style guides by default, including:

- Consistent indentation (2 spaces by default)
- Spaces around binary operators
- Spaces after commas in parameter lists and table fields
- Spaces after keywords like `if`, `for`, `while`, etc.
- Line breaks between statements and blocks
- Proper alignment of table fields and function parameters

You can customize these settings through the formatter options to match your project's style guide.
