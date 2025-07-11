// Main exports
export { LuauParser } from './parsers/luau.js';
export { LuaParser, ParseError } from './parsers/lua.js';

export { 
  LuaFormatter, 
  defaultFormatterOptions, 
  type FormatterOptions 
} from './clients/formatter.js';

export { 
  TypeGenerator, 
  defaultTypeGeneratorOptions, 
  type TypeGeneratorOptions, 
  type TypeScriptInterface, 
  type TypeScriptProperty 
} from './generators/typescript.js';

export { 
  Lexer, 
  TokenType, 
  type Token 
} from './clients/lexer.js';

// Plugin system
export {
  type Plugin,
  type PluginOptions,
  loadPlugins,
  applyPlugins
} from './plugins/plugin-system.js';

// AST Types
export * as AST from './types.js';

// Convenience functions
import { LuaParser } from './parsers/lua.js';
import { LuauParser } from './parsers/luau.js';
import { LuaFormatter } from './clients/formatter.js';
import { TypeGenerator } from './generators/typescript.js';
import * as AST from './types.js';

/**
 * Parse Lua code and return an AST
 */
export function parseLua(code: string): AST.Program {
  const parser = new LuaParser();
  return parser.parse(code);
}

/**
 * Parse Luau code and return an AST
 */
export function parseLuau(code: string): AST.Program {
  const parser = new LuauParser();
  return parser.parse(code);
}

/**
 * Format Lua/Luau code
 */
export function formatLua(code: string, options?: Partial<import('./clients/formatter.js').FormatterOptions>): string {
  const parser = new LuaParser();
  const formatter = new LuaFormatter(options);
  const ast = parser.parse(code);
  return formatter.format(ast);
}

/**
 * Format Luau code with type information
 */
export function formatLuau(code: string, options?: Partial<import('./clients/formatter.js').FormatterOptions>): string {
  const parser = new LuauParser();
  const formatter = new LuaFormatter(options);
  const ast = parser.parse(code);
  return formatter.format(ast);
}

/**
 * Generate TypeScript interfaces from Luau type definitions
 */
export function generateTypes(luauCode: string, options?: Partial<import('./generators/typescript.js').TypeGeneratorOptions>): string {
  const parser = new LuauParser();
  const generator = new TypeGenerator(options);
  const ast = parser.parse(luauCode);
  return generator.generateFromLuauAST(ast);
}

/**
 * Generate TypeScript interfaces from Luau type definitions with plugin support
 */
export async function generateTypesWithPlugins(
  luauCode: string, 
  options?: Partial<import('./generators/typescript.js').TypeGeneratorOptions>,
  pluginPaths?: string[]
): Promise<string> {
  const parser = new LuauParser();
  const generator = new TypeGenerator(options);
  const ast = parser.parse(luauCode);
  
  if (pluginPaths && pluginPaths.length > 0) {
    const { loadPlugins, applyPlugins } = await import('./plugins/plugin-system.js');
    const plugins = await loadPlugins(pluginPaths);
    
    applyPlugins(generator, plugins, {
      typeGeneratorOptions: options || {},
      config: {
        preserveComments: true,
        commentStyle: 'jsdoc'
      }
    });
  }
  
  return generator.generateFromLuauAST(ast);
}

/**
 * Analyze Lua/Luau code and return detailed information
 */
export function analyze(code: string, isLuau: boolean = false): {
  ast: AST.Program;
  formatted: string;
  types: string | undefined;
  errors: Error[];
} {
  const errors: Error[] = [];
  let ast: AST.Program;
  let formatted: string = '';
  let types: string | undefined;

  try {
    const parser = isLuau ? new LuauParser() : new LuaParser();
    ast = parser.parse(code);
  } catch (error) {
    errors.push(error as Error);
    // Return a minimal AST on parse error
    ast = { type: 'Program', body: [] };
  }

  try {
    const formatter = new LuaFormatter();
    formatted = formatter.format(ast);
  } catch (error) {
    errors.push(error as Error);
  }

  if (isLuau) {
    try {
      const generator = new TypeGenerator();
      types = generator.generateFromLuauAST(ast);
    } catch (error) {
      errors.push(error as Error);
    }
  }

  return { ast, formatted, types, errors };
}

// Export CLI module
export * from './cli/index';

// Version information
export const version = '0.1.0';
