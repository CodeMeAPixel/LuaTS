import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { generateTypes } from '../index.js';
import type { LuatsConfig } from './config.js';
import { loadPlugins } from '../plugins/plugin-system.js';

export interface ProcessorOptions {
  pattern: string;
  recursive: boolean;
  silent: boolean;
  verbose: boolean;
  config: LuatsConfig;
}

/**
 * Process all Lua/Luau files in a directory and convert them to TypeScript
 */
export async function processDirectory(
  inputDir: string, 
  outputDir: string, 
  options: ProcessorOptions
): Promise<void> {
  const { pattern, recursive, silent, verbose, config } = options;
  
  // Load plugins
  const plugins = await loadPlugins(config.plugins);
  
  if (verbose && !silent && plugins.length > 0) {
    console.log(`Loaded ${plugins.length} plugins: ${plugins.map(p => p.name).join(', ')}`);
  }
  
  // Find all matching files
  const files = await findFiles(inputDir, pattern, recursive);
  
  if (verbose && !silent) {
    console.log(`Found ${files.length} files to process`);
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process each file
  for (const file of files) {
    try {
      const relativePath = path.relative(inputDir, file);
      const outputPath = path.join(outputDir, path.dirname(relativePath), 
        `${path.basename(relativePath, path.extname(relativePath))}.d.ts`);
      
      // Ensure output directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      
      // Read input file
      const luaCode = fs.readFileSync(file, 'utf-8');
      
      // Generate TypeScript with plugin support
      const tsCode = await generateTypesWithPlugins(luaCode, config, plugins);
      
      // Write output file
      fs.writeFileSync(outputPath, tsCode, 'utf-8');
      
      successCount++;
      
      if (verbose && !silent) {
        console.log(`Converted ${file} -> ${outputPath}`);
      }
    } catch (error) {
      errorCount++;
      
      if (!silent) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
  
  if (!silent) {
    console.log(`Processed ${files.length} files: ${successCount} succeeded, ${errorCount} failed`);
  }
}

/**
 * Generate TypeScript with plugin support
 */
async function generateTypesWithPlugins(luaCode: string, config: LuatsConfig, plugins: any[]): Promise<string> {
  // If no plugins, use standard generation
  if (plugins.length === 0) {
    return generateTypes(luaCode, config.typeGeneratorOptions);
  }
  
  // Use the enhanced generation with plugins
  const { TypeGenerator } = await import('../generators/typescript.js');
  const { LuauParser } = await import('../parsers/luau.js');
  const { applyPlugins } = await import('../plugins/plugin-system.js');
  
  const parser = new LuauParser();
  const generator = new TypeGenerator(config.typeGeneratorOptions);
  
  // Parse the code
  const ast = parser.parse(luaCode);
  
  // Apply plugins
  applyPlugins(generator, plugins, {
    typeGeneratorOptions: config.typeGeneratorOptions,
    config: config
  });
  
  // Generate TypeScript
  return generator.generateFromLuauAST(ast);
}

/**
 * Find all files matching a pattern in a directory
 */
async function findFiles(directory: string, pattern: string, recursive: boolean): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: directory,
      absolute: true,
      nodir: true,
      dot: false,
      // Only use recursive mode if explicitly requested
      nocase: true
    };
    
    // Add the depth option only when recursive is false
    const finalOptions = recursive ? options : { ...options, depth: 0 };
    
    glob(pattern, finalOptions, (err: Error | null, matches: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    });
  });
}
