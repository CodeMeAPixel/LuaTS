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

- [Bun](https://bun.sh/) (preferred) or Node.js
- Git

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
   # or npm install
   ```
4. Build the project:
   ```bash
   bun run build
   # or npm run build
   ```

## Development Workflow

### Running in Development Mode

```bash
bun run dev
# or npm run dev
```

This will run the project in watch mode, automatically recompiling when files change.

### Running Tests

```bash
bun test
# or npm test
```

To run tests in watch mode:

```bash
bun test --watch
# or npm run test:watch
```

To run a specific test file:

```bash
bun test test/features.test.ts
# or npm run test:specific
```

### Linting and Formatting

To lint the code:

```bash
bun run lint
# or npm run lint
```

To fix linting issues automatically:

```bash
bun run lint:fix
# or npm run lint:fix
```

To format the code with Prettier:

```bash
bun run format
# or npm run format
```

## Project Structure

- `src/` - Source code
  - `parsers/` - Lua and Luau parsers
  - `clients/` - Formatter and lexer
  - `generators/` - TypeScript generator
  - `plugins/` - Plugin system
  - `cli/` - Command-line interface
  - `types.ts` - AST type definitions
  - `index.ts` - Main exports
- `test/` - Tests
  - `fixtures/` - Test fixtures
  - `snapshots/` - Snapshot tests
  - `debug/` - Debug utilities
- `examples/` - Example usage
- `dist/` - Compiled output (generated)
- `docs/` - Documentation

## Coding Guidelines

### TypeScript

- Use TypeScript for all code
- Follow the existing code style (enforced by ESLint and Prettier)
- Maintain strict typing with minimal use of `any`
- Use interfaces over types for object shapes
- Document public APIs with JSDoc comments

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Use snapshot tests for type generation
- Test edge cases and error handling

### Git Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub

## Pull Request Guidelines

When submitting a pull request:

1. Ensure all tests pass
2. Update documentation if necessary
3. Add tests for new features
4. Update the README if applicable
5. Provide a clear description of the changes
6. Link to any related issues

## Versioning

LuaTS follows [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes

## Documentation

- Update the documentation for any API changes
- Document new features with examples
- Fix documentation issues or typos
- Test documentation examples to ensure they work

## Feature Requests and Bug Reports

- Use GitHub Issues to report bugs or request features
- Provide detailed information for bug reports:
  - Expected behavior
  - Actual behavior
  - Steps to reproduce
  - Environment details (OS, Node.js version, etc.)
- For feature requests, describe the problem you're trying to solve

## License

By contributing to LuaTS, you agree that your contributions will be licensed under the project's [MIT License](https://github.com/codemeapixel/luats/blob/main/LICENSE).
