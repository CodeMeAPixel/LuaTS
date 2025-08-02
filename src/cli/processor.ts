import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { LuatsConfig } from './config';
import { generateTypes } from '../index';

/**
 * Process a single file
 */
export async function processFile(
  inputPath: string,
  outputPath: string,
  config: LuatsConfig
): Promise<void> {
  try {
    // Read the input file
    const luaCode = fs.readFileSync(inputPath, 'utf-8');
    
    // Generate TypeScript code with proper options
    const tsCode = await generateTypeScript(luaCode, {
      ...config.typeGeneratorOptions,
      // Fix: Pass the properties directly from typeGeneratorOptions or use defaults
      preserveComments: config.preserveComments ?? true,
      commentStyle: config.commentStyle ?? 'jsdoc'
    });
    
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
    const files = glob.sync(config.include?.[0] || '**/*.{lua,luau}', {
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
 * Generate TypeScript code from Lua code, applying plugins if configured
 */
async function generateTypeScript(
  luaCode: string, 
  config: any // Change type to 'any' temporarily to fix the error
): Promise<string> {
  // Use the real generator with all options passed
  return generateTypes(luaCode, {
    useUnknown: config.typeGeneratorOptions?.useUnknown,
    interfacePrefix: config.typeGeneratorOptions?.interfacePrefix,
    semicolons: config.typeGeneratorOptions?.semicolons,
    preserveComments: config.preserveComments,
    commentStyle: config.commentStyle
  });
}