# FAILING_TESTS

## Type Generator
- [ ] Convert function types: Function return type is `any` instead of the correct type (should be `boolean`, `number`, etc.).
- [ ] Convert method types: Method signatures are not correctly omitting `self` and/or return type is not correct.
- [ ] Comment Preservation: Single-line and multi-line comments are not preserved in the generated TypeScript.
- [ ] Advanced Type Conversion: Union types with object literals are not handled correctly.
- [ ] Advanced Type Conversion: Functions with multiple parameters are not handled correctly.
- [ ] Type Generator Options: `useUnknown` does not output `unknown` as expected.
- [ ] Type Generator Options: `interfacePrefix` does not prefix interface names as expected.
- [ ] Type Generator Options: `semicolons` option does not control semicolon output as expected.

## Error Handling
- [ ] Syntax errors are not always detected (test expects errors, but none are reported).

## Snapshot Tests
- [ ] Game types snapshot does not match expected output (likely due to comment or type conversion issues).

## CLI Tools
- [ ] Convert a single file: Output file is not generated or does not contain expected content.
- [ ] Convert a directory: Output files are not generated or do not contain expected content.
- [ ] Validate a file: CLI does not validate file as expected.
- [ ] Use config file: CLI does not respect config file options.

## Plugins
- [ ] Plugin system: Plugin transforms are not applied as expected (e.g., type transforms, added fields).

---
**Note:**  
- Some failures are due to missing or incomplete features (e.g., plugin system, comment preservation).
- Some failures are due to incorrect or missing type conversions (especially for function and method types).
- Some failures are due to CLI not being fully implemented or not matching test expectations.
