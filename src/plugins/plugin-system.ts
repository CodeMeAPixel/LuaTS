import * as AST from '../types.js';
import { TypeGenerator } from '../generators/typescript.js';

export interface PluginOptions {
  typeGeneratorOptions: any;
  config: any;
}

export interface Plugin {
  name: string;
  description: string;
  transformType?: (
    type: AST.LuauType, 
    tsType: string, 
    options: PluginOptions
  ) => string;
  transformInterface?: (
    interfaceName: string, 
    properties: any[], 
    options: PluginOptions
  ) => { name: string, properties: any[] };
  preProcess?: (
    ast: AST.Program, 
    options: PluginOptions
  ) => AST.Program;
  postProcess?: (
    generatedCode: string, 
    options: PluginOptions
  ) => string;
}

/**
 * Load plugins from configuration
 */
export async function loadPlugins(pluginPaths: string[]): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  
  for (const pluginPath of pluginPaths) {
    try {
      // Dynamic import of the plugin
      const plugin = await import(pluginPath);
      
      // Validate plugin structure
      if (!plugin.name || typeof plugin.name !== 'string') {
        console.warn(`Plugin at ${pluginPath} is missing a valid name property`);
        continue;
      }
      
      // Add the plugin to the list
      plugins.push(plugin);
      console.log(`Loaded plugin: ${plugin.name}`);
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginPath}:`, error);
    }
  }
  
  return plugins;
}

/**
 * Apply plugins to a TypeGenerator
 */
export function applyPlugins(
  generator: TypeGenerator, 
  plugins: Plugin[], 
  options: PluginOptions
): void {
  // Store original methods that we'll be enhancing
  const originalConvertLuauTypeToTypeScript = generator.convertLuauTypeToTypeScript.bind(generator);
  const originalProcessTypeAlias = generator.processTypeAlias.bind(generator);
  const originalGenerateTypeScriptCode = generator.generateTypeScriptCode.bind(generator);
  
  // Enhance the convertLuauTypeToTypeScript method
  generator.convertLuauTypeToTypeScript = function(luauType: AST.LuauType): string {
    let tsType = originalConvertLuauTypeToTypeScript(luauType);
    
    // Apply transformType plugin hooks
    for (const plugin of plugins) {
      if (plugin.transformType) {
        tsType = plugin.transformType(luauType, tsType, options);
      }
    }
    
    return tsType;
  };
  
  // Enhance the processTypeAlias method
  generator.processTypeAlias = function(typeAlias: AST.TypeAlias): void {
    // Call original method first
    originalProcessTypeAlias(typeAlias);
    
    // Apply transformInterface plugin hooks
    const name = typeAlias.name.name;
    const interfaceObj = generator.getInterface(name);
    
    if (interfaceObj) {
      for (const plugin of plugins) {
        if (plugin.transformInterface) {
          const transformed = plugin.transformInterface(
            interfaceObj.name, 
            interfaceObj.properties, 
            options
          );
          
          if (transformed) {
            generator.addCustomInterface(transformed);
          }
        }
      }
    }
  };
  
  // Enhance the generateTypeScriptCode method
  generator.generateTypeScriptCode = function(): string {
    let code = originalGenerateTypeScriptCode();
    
    // Apply postProcess plugin hooks
    for (const plugin of plugins) {
      if (plugin.postProcess) {
        code = plugin.postProcess(code, options);
      }
    }
    
    return code;
  };
}
