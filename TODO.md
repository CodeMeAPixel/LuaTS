# TODO Checklist

- [x] **Fix all TypeScript build errors and warnings**
  - [x] Remove duplicate/unused functions and variables
  - [x] Correct all type/interface issues (especially optional properties)
  - [x] Ensure all imports are correct and used
- [x] **Implement real Lua/Luau parsing in `generateTypeScript`**
  - [x] Integrate or stub a parser for Lua/Luau AST generation
- [x] **Add proper plugin loading and application in CLI processor**
  - [x] Remove duplicate `applyPlugins` and implement dynamic plugin loading
- [x] **Expand CLI validation logic beyond placeholder**
  - [x] Add real validation for Lua/Luau files
- [ ] **Write unit tests for CLI and processor modules**
  - [ ] Cover CLI commands and processor logic
- [ ] **Improve error handling and user feedback in CLI**
  - [ ] Make CLI output clear and actionable
- [x] **Document configuration options and CLI usage**
  - [x] Add README and CLI help improvements
- [ ] **Add support for more CLI commands (e.g., format, lint)**
- [ ] **Ensure cross-platform compatibility (Windows, Linux, macOS)**
  - [ ] Replace `rm -rf` with cross-platform alternatives (e.g., `rimraf`)
- [ ] **Set up CI for automated builds and tests**
  - [ ] Add GitHub Actions or similar workflow

---

## Additional Ideas & Improvements

- [ ] **Publish TypeScript declaration files (`.d.ts`) for all public APIs**
- [ ] **Add ESM and CJS dual support with proper `"exports"` field**
- [ ] **Provide a VSCode extension for Lua/Luau → TypeScript conversion**
- [ ] **Add support for custom output templates (e.g., for JSDoc, TSDoc, etc.)**
- [ ] **Enable incremental builds for large codebases**
- [ ] **Support for Lua 5.4 and future Luau features**
- [ ] **Add a web playground (REPL) for live conversion and preview**
- [ ] **Add a `luats init` command to scaffold config and example files**
- [ ] **Support for YAML config files in addition to JSON**
- [ ] **Add CLI auto-completion scripts for bash/zsh/fish**
- [ ] **Improve error messages with code frames and suggestions**
- [ ] **Add a `luats watch` mode for live conversion in dev workflows**
- [ ] **Provide migration guides for legacy Lua codebases**
- [ ] **Add benchmarking and performance tests**
- [ ] **Support for sourcemaps or code mapping back to Lua**
- [ ] **Add a logo/banner to npm and GitHub README**
- [ ] **Add badges for test coverage, bundle size, etc.**
- [ ] **Publish example projects and templates**
- [ ] **Add a `luats doctor` command for troubleshooting environment/config issues**
- [ ] **Support for monorepo setups and workspace-aware config**
- [ ] **Add support for extern types/classes (typically ending in a .d.lua file)**
- [ ] **Add ability to reverse logic (ie: transform typescript into lua)**
