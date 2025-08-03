import * as fs from 'fs';
import * as path from 'path';
import { TypeGenerator } from '../generators/typescript/generator';

/**
 * Plugin interface
 */
export interface Plugin {
  name: string;
  description: string;
  version?: string;
  
  // Plugin transformation methods
  transformType?: (luauType: string, tsType: string, options?: any) => string;
  transformInterface?: (
    name: string, 
    properties: any[], 
    options?: any
  ) => { name: string; properties: any[] };
  
  process?: (ast: any, options: any) => any;
  postProcess?: (generatedCode: string, options: any) => string;
}

/**
 * Enhanced TypeGenerator that supports plugins - COMPLETED IMPLEMENTATION
 */
class PluginAwareTypeGenerator extends TypeGenerator {
  private plugins: Plugin[] = [];

  public addPlugin(plugin: Plugin): void {
    this.plugins.push(plugin);
  }

  // Override the parent's convertType method to apply plugin transformations
  public convertType(type: any): string {
    let tsType = super.convertType(type);
    
    // Apply type transformations from plugins
    for (const plugin of this.plugins) {
      if (plugin.transformType) {
        const originalType = type?.type || 'unknown';
        const transformedType = plugin.transformType(originalType, tsType, {});
        if (transformedType !== tsType) {
          tsType = transformedType;
        }
      }
    }
    
    return tsType;
  }

  // Override processTypeAlias to apply plugin interface transformations
  public processTypeAlias(typeAlias: any): void {
    super.processTypeAlias(typeAlias);
    
    // Apply interface transformations from plugins
    const name = typeAlias.name.name;
    const interfaces = this.getAllInterfaces();
    
    for (const iface of interfaces) {
      if (iface.name === name || iface.name.endsWith(name)) {
        for (const plugin of this.plugins) {
          if (plugin.transformInterface) {
            const result = plugin.transformInterface(
              iface.name,
              iface.properties,
              {}
            );
            
            if (result) {
              // Update the interface with transformed data
              iface.name = result.name;
              iface.properties = result.properties;
            }
          }
        }
      }
    }
  }

  // Override generateCode to apply post-processing plugins
  public generateTypeScript(luaCode: string): string {
    let code = super.generateTypeScript(luaCode);
    
    // Apply post-processing from plugins
    for (const plugin of this.plugins) {
      if (plugin.postProcess) {
        const processedCode = plugin.postProcess(code, {});
        if (processedCode !== code) {
          code = processedCode;
        }
      }
    }
    
    return code;
  }
}

/**
 * Load a plugin from a file path
 */
export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  try {
    // Use absolute path resolution
    const absolutePath = path.resolve(pluginPath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Plugin not found: ${absolutePath}`);
    }
    
    // Clear require cache for hot reloading
    delete require.cache[require.resolve(absolutePath)];
    
    // Use dynamic import for better module loading
    let pluginModule;
    try {
      pluginModule = require(absolutePath);
    } catch (requireError) {
      // Fallback to dynamic import for ESM modules
      pluginModule = await import('file://' + absolutePath);
    }
    
    // Handle both default exports and direct exports
    const plugin = pluginModule.default || pluginModule;
    
    if (!plugin || typeof plugin !== 'object') {
      throw new Error(`Invalid plugin format: ${pluginPath}`);
    }
    
    if (!plugin.name || !plugin.description) {
      throw new Error(`Plugin missing required fields: ${pluginPath}`);
    }
    
    return plugin;
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
      console.error(`Error loading plugin: ${(error as Error).message}`);
    }
  }
  
  return plugins;
}

/**
 * Apply plugins to a type generator - FIXED FILE LOADING
 */
export function applyPlugins(
  generator: TypeGenerator,
  plugins: (string | Plugin)[]
): void {
  console.log(`Applying ${plugins.length} plugins`);
  
  for (const pluginItem of plugins) {
    try {
      let plugin: Plugin;
      
      if (typeof pluginItem === 'string') {
        // FIXED: Synchronous plugin loading with better error handling
        try {
          const absolutePath = path.resolve(pluginItem);
          
          if (!fs.existsSync(absolutePath)) {
            console.log(`Plugin file not found, skipping: ${pluginItem}`);
            continue;
          }
          
          // Clear require cache for hot reloading
          delete require.cache[require.resolve(absolutePath)];
          const pluginModule = require(absolutePath);
          
          // Handle both default exports and direct exports
          plugin = pluginModule.default || pluginModule;
          
          if (!plugin || typeof plugin !== 'object') {
            console.error(`Invalid plugin format: ${pluginItem}`);
            continue;
          }
          
          if (!plugin.name || !plugin.description) {
            console.error(`Plugin missing required fields (name, description): ${pluginItem}`);
            continue;
          }
          
          console.log(`Loaded plugin from file: ${plugin.name} v${plugin.version || '1.0.0'}`);
        } catch (error) {
          console.error(`Failed to load plugin from ${pluginItem}: ${(error as Error).message}`);
          continue;
        }
      } else {
        plugin = pluginItem;
      }
      
      console.log(`Applying plugin: ${plugin.name}`);
      
      // Apply plugin transformations
      if (generator instanceof PluginAwareTypeGenerator) {
        generator.addPlugin(plugin);
      } else {
        // For standard generators, apply transformations manually
        applyPluginManually(generator, plugin);
      }
    } catch (error) {
      console.error(`Error applying plugin: ${(error as Error).message}`);
    }
  }
}

/**
 * Manually apply plugin transformations to a standard TypeGenerator - COMPLETED
 */
function applyPluginManually(generator: TypeGenerator, plugin: Plugin): void {
  console.log(`Applying plugin: ${plugin.name}`);
  
  // Get all interfaces from the generator
  const interfaces = generator.getAllInterfaces();
  
  // Apply plugin transformations to each interface
  for (const tsInterface of interfaces) {
    if (plugin.transformInterface) {
      const updatedInterface = plugin.transformInterface(
        tsInterface.name, 
        tsInterface.properties,
        {}
      );
      
      if (updatedInterface) {
        // Update the interface in the generator
        updatedInterface.name = tsInterface.name; // Preserve original name mapping
        generator.addInterface(updatedInterface);
      }
    }
  }
}

/**
 * Generate TypeScript types with plugins - ENHANCED WITH FILE LOADING
 */
export async function generateTypesWithPlugins(
  luaCode: string,
  options: any = {},
  plugins: (string | Plugin)[] = []
): Promise<string> {
  try {
    // Create a plugin-aware generator
    const generator = new PluginAwareTypeGenerator(options);

    // Load and apply plugins (both file-based and object-based)
    for (const pluginItem of plugins) {
      let plugin: Plugin;
      
      if (typeof pluginItem === 'string') {
        // ENHANCED: Async file-based plugin loading
        try {
          plugin = await loadPlugin(pluginItem);
          console.log(`Loaded plugin from file: ${plugin.name} v${plugin.version || '1.0.0'}`);
        } catch (error) {
          console.error(`Failed to load plugin from ${pluginItem}: ${(error as Error).message}`);
          continue;
        }
      } else {
        plugin = pluginItem;
      }
      
      // Add the plugin to the generator
      generator.addPlugin(plugin);
    }

    // Generate TypeScript with plugins applied
    return generator.generateTypeScript(luaCode);
  } catch (error) {
    console.error('Error in generateTypesWithPlugins:', error);
    throw error;
  }
}

/**
 * Load plugins from a directory - FIXED
 */
export async function loadPluginsFromDirectory(directoryPath: string): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  
  try {
    const absolutePath = path.resolve(directoryPath);
    
    if (!fs.existsSync(absolutePath)) {
      console.warn(`Plugin directory not found: ${directoryPath}`);
      return plugins;
    }
    
    const files = fs.readdirSync(absolutePath);
    const pluginFiles = files.filter(file => 
      file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.ts')
    );
    
    for (const file of pluginFiles) {
      const fullPath = path.join(absolutePath, file);
      try {
        const plugin = await loadPlugin(fullPath);
        plugins.push(plugin);
        console.log(`Loaded plugin: ${plugin.name} from ${file}`);
      } catch (error) {
        console.error(`Failed to load plugin ${file}: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    console.error(`Error reading plugin directory ${directoryPath}: ${(error as Error).message}`);
  }
  
  return plugins;
}

/**
 * Validate plugin structure - NEW UTILITY
 */
export function validatePlugin(plugin: any): plugin is Plugin {
  if (!plugin || typeof plugin !== 'object') {
    return false;
  }
  
  if (typeof plugin.name !== 'string' || !plugin.name.trim()) {
    return false;
  }
  
  if (typeof plugin.description !== 'string' || !plugin.description.trim()) {
    return false;
  }
  
  // Optional fields validation
  if (plugin.version !== undefined && typeof plugin.version !== 'string') {
    return false;
  }
  
  if (plugin.transformType !== undefined && typeof plugin.transformType !== 'function') {
    return false;
  }
  
  if (plugin.transformInterface !== undefined && typeof plugin.transformInterface !== 'function') {
    return false;
  }
  
  if (plugin.process !== undefined && typeof plugin.process !== 'function') {
    return false;
  }
  
  if (plugin.postProcess !== undefined && typeof plugin.postProcess !== 'function') {
    return false;
  }
  
  return true;
}

// Export the plugin-aware generator for external use
export { PluginAwareTypeGenerator };
