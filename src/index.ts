/**
 * LuaTS - A TypeScript library for Lua/Luau parsing and transformation
 */

// Export CLI tools
export * from './cli/index';

// Export plugin system
export type { Plugin } from './plugins/plugin-system';
export { loadPlugin, loadPlugins, applyPlugins, generateTypesWithPlugins } from './plugins/plugin-system';

// Export type generator
export type { TypeGeneratorOptions } from './generators';
export { TypeGenerator } from './generators';

// Export parsers
export { LuaParser, ParseError } from './parsers/lua';
export { LuauParser } from './parsers/luau';

// Export formatter
export { LuaFormatter } from './clients/formatter';

// Export lexer
export { Lexer, TokenType, Token } from './clients/lexer';

// Export AST types
export * as AST from './types';

// --- Convenience Functions ---

// Convenience functions
import { LuaParser } from './parsers/lua';
import { LuauParser } from './parsers/luau';
// If you have these, import them as well:
import { LuaFormatter } from './clients/formatter';
import { TypeGenerator } from './generators';

// parseLua: string -> AST.Program
export function parseLua(code: string) {
  const parser = new LuaParser();
  return parser.parse(code);
}

// parseLuau: string -> AST.Program
export function parseLuau(code: string) {
  const parser = new LuauParser();
  return parser.parse(code);
}

// formatLua: AST.Program -> string
export function formatLua(ast: any) {
  const formatter = new LuaFormatter();
  return formatter.format(ast);
}

// generateTypes: string -> string
export function generateTypes(code: string, options?: any) {
  const { LuauParser } = require('./parsers/luau');
  const parser = new LuauParser();
  const ast = parser.parse(code);
  const generator = new TypeGenerator(options || {});
  return generator.generate(ast); // <-- use .generate instead of .generateTypeScript
}

// analyze: string, isLuau? -> any
export function analyze(code: string, isLuau = false) {
  let ast: any = null;
  let errors: any[] = [];
  let types: string | undefined = undefined;
  try {
    const parser = isLuau ? new (require('./parsers/luau').LuauParser)() : new (require('./parsers/lua').LuaParser)();
    ast = parser.parse(code);
    if (isLuau) {
      const generator = new TypeGenerator();
      types = generator.generate(ast);
    }
  } catch (err: any) {
    errors.push(err);
    ast = ast || { type: 'Program', body: [] };
  }
  return { errors, ast, types };
}

// Version information
export const version = '0.1.0';