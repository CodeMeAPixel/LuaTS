import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { LuatsConfig } from './config';

// Import your core modules
import { Parser } from '../parsers/lua';
import { TypeGenerator } from '../generators/typescript';

// Interface for plugin context
interface PluginContext {
  typeGeneratorOptions?: any;
  config?: LuatsConfig;
}

/**
 * Process a single file
 */
export async function processFile(
  inputPath: string,
  outputPath: string,
  config: LuatsConfig
): Promise<void> {
  try {
    // Determine if file is Luau based on extension
    const isLuau = inputPath.endsWith('.luau');
    
    // Read the input file
    const luaCode = fs.readFileSync(inputPath, 'utf-8');
    
    // Generate TypeScript code
    const tsCode = generateTypeScript(luaCode, isLuau, config);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the output file
    fs.writeFileSync(outputPath, tsCode, 'utf-8');
    
    if (config.verbose) {
      console.log(`Processed: ${inputPath} -> ${outputPath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${inputPath}: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Process a directory
 */
export async function processDirectory(
  inputDir: string,
  outputDir: string,
  config: LuatsConfig
): Promise<void> {
  try {
    // Get all matching files
    const files = glob.sync(config.include || ['**/*.{lua,luau}'], {
      cwd: inputDir,
      ignore: config.exclude || ['**/node_modules/**', '**/dist/**'],
      absolute: false
    });
    
    // Process each file
    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(
        outputDir,
        file.replace(/\.lua$|\.luau$/, '.ts')
      );
      
      await processFile(inputPath, outputPath, config);
    }
    
    if (config.verbose) {
      console.log(`Processed ${files.length} files from ${inputDir} to ${outputDir}`);
    }
  } catch (error) {
    console.error(`Error processing directory ${inputDir}: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Generate TypeScript code from Lua code
 */
function generateTypeScript(luaCode: string, isLuau: boolean, config: LuatsConfig): string {
  // Initialize parser based on whether it's Luau or Lua
  const parser = new Parser({
    luaVersion: isLuau ? 'luau' : (config.parserOptions?.luaVersion || '5.1'),
    locations: config.parserOptions?.locations,
    comments: config.parserOptions?.comments,
    scope: config.parserOptions?.scope
  });
  
  // Initialize type generator
  const generator = new TypeGenerator(config.typeGeneratorOptions || {});
  
  // Parse the Lua code
  const ast = parser.parse(luaCode);
  
  // Apply plugins if configured
  if (config.plugins && config.plugins.length > 0) {
    applyPlugins(generator, config.plugins, {
      typeGeneratorOptions: config.typeGeneratorOptions,
      config: config
    });
  }
  
  // Generate TypeScript code
  return generator.generate(ast);
}

/**
 * Apply plugins to the generator
 */
function applyPlugins(
  generator: TypeGenerator,
  plugins: string[],
  context: PluginContext
): void {
  // This is a placeholder for plugin implementation
  // In a real implementation, you would load and apply each plugin
  
  for (const pluginName of plugins) {
    try {
      // Here you would load the plugin and apply it
      console.log(`Applying plugin: ${pluginName}`);
    } catch (error) {
      console.error(`Error applying plugin ${pluginName}: ${(error as Error).message}`);
    }
  }
}
