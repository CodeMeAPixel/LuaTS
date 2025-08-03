---
layout: default
title: Contributing
nav_order: 7
---

# Contributing to LuaTS
{: .no_toc }

This guide will help you contribute to the LuaTS project.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (required for full development experience)
- Git
- Basic understanding of TypeScript, Lua, and AST concepts

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/luats.git
   cd luats
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Build the project:
   ```bash
   bun run build
   ```

## Project Architecture

Understanding LuaTS's modular architecture is crucial for contributing effectively:

```
src/
├── parsers/              # Code parsing (Lua, Luau)
│   ├── lua.ts           # Standard Lua parser
│   └── luau.ts          # Luau parser with type support
├── clients/             # Code processing and analysis
│   ├── components/      # Modular lexer components
│   │   ├── lexer.ts    # Main lexer implementation
│   │   ├── tokenizers.ts # Specialized tokenizers
│   │   ├── operators.ts # Operator definitions
│   │   └── types.ts    # Token type definitions
│   ├── lexer.ts        # Lexer re-export for compatibility
│   └── formatter.ts    # Code formatting
├── generators/          # Code generation
│   ├── typescript/     # TypeScript generator
│   └── markdown/       # Documentation generator
├── plugins/            # Plugin system
│   └── plugin-system.ts # Plugin architecture
├── cli/               # Command-line interface
├── types.ts           # Core AST type definitions
└── index.ts           # Main library exports
```

### Key Components

#### Modular Lexer System
The lexer uses a component-based architecture where each tokenizer handles specific language constructs:

- **NumberTokenizer**: Handles numeric literals with decimal and scientific notation
- **StringTokenizer**: Handles string literals including template strings
- **IdentifierTokenizer**: Handles identifiers and keywords with contextual parsing
- **CommentTokenizer**: Handles single-line and multi-line comments

#### Plugin Architecture
The plugin system allows extending type generation through transformation hooks:

- **transformType**: Transform individual type mappings
- **transformInterface**: Modify generated interfaces
- **postProcess**: Transform final generated code
- **process**: Pre-process AST before generation

## Development Workflow

### Running in Development Mode

```bash
bun run dev
```

This runs the project in watch mode, automatically recompiling when files change.

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test test/features.test.ts

# Run plugin tests specifically
bun test test/plugins.test.ts
```

> **Note:**  
> LuaTS is developed and tested primarily with Bun. Node.js is not officially supported for development or testing, though the final library works in Node.js environments.

### Testing Guidelines

When adding new features or fixing bugs:

1. **Write comprehensive tests** covering edge cases
2. **Update snapshot tests** if type generation changes
3. **Test plugin compatibility** if modifying the plugin system
4. **Verify CLI functionality** for user-facing changes

### Linting and Formatting

```bash
# Lint the code
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Format the code with Prettier
bun run format
```

## Contributing to Different Components

### Adding New Language Features

When adding support for new Lua/Luau language features:

1. **Update the lexer** if new tokens are needed:
   ```typescript
   // Add to src/clients/components/types.ts
   export enum TokenType {
     // ...existing tokens...
     NEW_FEATURE = 'NEW_FEATURE',
   }
   ```

2. **Create or extend tokenizers** in `src/clients/components/tokenizers.ts`

3. **Update the parser** to handle the new syntax in `src/parsers/lua.ts` or `src/parsers/luau.ts`

4. **Add AST node types** in `src/types.ts`

5. **Update type generation** in `src/generators/typescript/generator.ts`

6. **Add comprehensive tests** covering the new feature

### Contributing to the Plugin System

When extending the plugin system:

1. **Add new plugin hooks** to the `Plugin` interface:
   ```typescript
   export interface Plugin {
     // ...existing hooks...
     newHook?: (data: any, options: any) => any;
   }
   ```

2. **Implement hook calling** in `PluginAwareTypeGenerator`

3. **Update plugin documentation** with examples

4. **Add tests** demonstrating the new functionality

### Contributing to the CLI

When adding CLI features:

1. **Add new commands** in `src/cli/`
2. **Update help text** and documentation
3. **Add configuration options** if needed
4. **Test with various file structures**

### Contributing to Parsers

When fixing parser issues or adding features:

1. **Understand AST structure** - review `src/types.ts`
2. **Add test cases first** - write failing tests for the issue
3. **Implement the fix** in the appropriate parser
4. **Verify AST correctness** - ensure generated ASTs are well-formed
5. **Update type generation** if new AST nodes are added

## Code Quality Standards

### TypeScript Guidelines

- **Strict typing**: Avoid `any` except where absolutely necessary
- **Interface over types**: Use interfaces for object shapes
- **Consistent naming**: Use PascalCase for classes, camelCase for functions/variables
- **JSDoc comments**: Document public APIs comprehensively

### Testing Standards

- **Test file naming**: `*.test.ts` for unit tests
- **Snapshot tests**: Use for type generation output verification
- **Edge case coverage**: Test boundary conditions and error cases
- **Plugin testing**: Verify plugins work in isolation and combination

### Error Handling

- **Descriptive errors**: Provide clear error messages with context
- **Error types**: Use specific error types (`ParseError`, `LexError`)
- **Graceful degradation**: Handle edge cases without crashing
- **Recovery strategies**: Allow parsing to continue when possible

## Git Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-generic-types` - New features
- `fix/parser-string-escape` - Bug fixes  
- `refactor/modular-lexer` - Code refactoring
- `docs/plugin-examples` - Documentation updates

### Commit Messages

Follow conventional commit format:
```
type(scope): description

- feat(parser): add support for generic type parameters
- fix(lexer): handle escaped quotes in string literals
- docs(plugins): add advanced plugin examples
- test(cli): add integration tests for watch mode
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** with tests
3. **Update documentation** if needed
4. **Ensure all tests pass**
5. **Submit pull request** with clear description

## Pull Request Guidelines

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated snapshot tests if needed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes without version bump
```

### Review Criteria

PRs will be reviewed for:
- **Code quality** and adherence to standards
- **Test coverage** and quality
- **Documentation** completeness
- **Performance** implications
- **Breaking changes** identification

## Contributing to Documentation

### Documentation Structure

- **API Reference**: Technical documentation for all components
- **Examples**: Practical usage examples and tutorials
- **Plugin Guide**: Comprehensive plugin development guide
- **Contributing Guide**: This guide for contributors

### Documentation Standards

- **Clear examples**: Provide working code examples
- **Up-to-date content**: Ensure examples work with current version
- **Cross-references**: Link related concepts
- **Code snippets**: Test all code examples

## Advanced Contributing Topics

### Performance Optimization

When optimizing performance:

1. **Profile first** - identify actual bottlenecks
2. **Benchmark changes** - measure impact quantitatively
3. **Consider memory usage** - especially for large files
4. **Test with real-world code** - use actual Lua/Luau projects

### Plugin Development Guidelines

When creating example plugins:

1. **Follow plugin interface** strictly  
2. **Handle edge cases** gracefully
3. **Provide clear documentation**
4. **Include usage examples**
5. **Test plugin composition** with other plugins

### Architecture Decisions

For significant architectural changes:

1. **Open an issue** for discussion first
2. **Consider backward compatibility**
3. **Document design decisions**
4. **Plan migration path** if needed

## Community Guidelines

### Code of Conduct

- **Be respectful** in all interactions
- **Provide constructive feedback**
- **Help newcomers** learn the codebase
- **Focus on technical merit** of contributions

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and design discussions
- **Code Review**: For feedback on implementation approach

## Release Process

### Version Management

LuaTS follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

For maintainers preparing releases:

1. **Update version** in `package.json`
2. **Update CHANGELOG** with notable changes
3. **Run full test suite**
4. **Build and test distribution**
5. **Tag release** and publish

Thank you for contributing to LuaTS! Your contributions help improve the Lua/TypeScript development experience for everyone.
