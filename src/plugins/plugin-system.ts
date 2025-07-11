import * as fs from 'fs';
import { TypeGenerator } from '../generators';
import { LuaParser } from '../parsers/lua';
import { LuauParser } from '../parsers/luau';

/**
 * Plugin interface
 */
export interface Plugin {
  name: string;
  description: string;
  version?: string; // Make version optional
  
  // Optional plugin methods
  transformType?: (luauType: string, tsType: string, options?: any) => string;
  transformInterface?: (
    name: string, 
    properties: any[], 
    options?: any
  ) => { name: string; properties: any[] };
  
  // Add additional plugin methods that are used in comment-plugin.ts
  process?: (ast: any, options: any) => any;
  postProcess?: (generatedCode: string, options: any) => string;
}

/**
 * Load a plugin from a file path
 */
export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  try {
    // Check if plugin exists
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin not found: ${pluginPath}`);
    }
    
    // Import the plugin
    const plugin = await import(pluginPath);
    
    // Check if it's a valid plugin
    if (!plugin.default || typeof plugin.default !== 'object') {
      throw new Error(`Invalid plugin format: ${pluginPath}`);
    }
    
    // Check required fields
    if (!plugin.default.name || !plugin.default.description) {
      throw new Error(`Plugin missing required fields: ${pluginPath}`);
    }
    
    return plugin.default;
  } catch (error) {
    throw new Error(`Failed to load plugin ${pluginPath}: ${(error as Error).message}`);
  }
}

/**
 * Load plugins from paths
 */
export async function loadPlugins(pluginPaths: string[]): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  
  for (const pluginPath of pluginPaths) {
    try {
      const plugin = await loadPlugin(pluginPath);
      plugins.push(plugin);
    } catch (error: unknown) {
      // Fix error type
      console.error(`Error loading plugin: ${(error as Error).message}`);
    }
  }
  
  return plugins;
}

/**
 * Apply plugins to a type generator
 */
export function applyPlugins(
  generator: TypeGenerator,
  plugins: (string | Plugin)[]
): void {
  // Process each plugin
  for (const pluginItem of plugins) {
    try {
      let plugin: Plugin;
      
      // If plugin is a string, load it
      if (typeof pluginItem === 'string') {
        // For now, we'll just log instead of trying to dynamically load
        console.log(`Would load plugin from: ${pluginItem}`);
        continue;
      } else {
        plugin = pluginItem;
      }
      
      // Apply plugin transformations
      applyPluginToGenerator(generator, plugin);
    } catch (error) {
      console.error(`Error applying plugin: ${(error as Error).message}`);
    }
  }
}

/**
 * Apply a single plugin to a generator
 */
function applyPluginToGenerator(generator: TypeGenerator, plugin: Plugin): void {
  // This is a placeholder implementation
  console.log(`Applying plugin: ${plugin.name}`);
  
  // Apply interface transformations if available
  if (plugin.transformInterface) {
    for (const tsInterface of generator.getAllInterfaces()) {
      const result = plugin.transformInterface(
        tsInterface.name,
        tsInterface.properties,
        {}
      );
      
      if (result) {
        // Update the interface
        const updatedInterface = {
          ...tsInterface,
          name: result.name,
          properties: result.properties
        };
        
        generator.addInterface(updatedInterface);
      }
    }
  }
}

/**
 * Generate TypeScript types with plugins
 */
export async function generateTypesWithPlugins(
  luaCode: string,
  options: any = {},
  plugins: (string | Plugin)[] = []
): Promise<string> {
  // Create a generator
  const generator = new TypeGenerator(options);

  // Parse the Lua code (determine if it's Luau by checking for type annotations)
  const isLuau = luaCode.includes(':') || luaCode.includes('type ');

  // Use the correct parser
  const parser = isLuau ? new LuauParser() : new LuaParser();
  const ast = parser.parse(luaCode);

  // Apply plugins
  applyPlugins(generator, plugins);

  // Generate TypeScript
  return generator.generate(ast);
}
