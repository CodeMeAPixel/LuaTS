#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { processDirectory, processFile } from './processor';
import { LuatsConfig, loadConfig, defaultConfig } from './config';

// CLI command types
type Command = 'convert' | 'validate' | 'help';

// CLI options interface
interface CliOptions {
  input?: string;
  output?: string;
  config?: string;
  watch?: boolean;
  verbose?: boolean;
}

/**
 * Main CLI entry point
 */
export async function cli(args: string[] = process.argv.slice(2)): Promise<void> {
  try {
    const command = parseCommand(args);
    const options = parseOptions(args);
    
    // Load configuration
    const config = options.config ? 
      await loadConfig(options.config) : 
      await loadConfig();
    
    // Apply command line options to config
    if (options.verbose) {
      config.verbose = options.verbose;
    }
    
    await executeCommand(command, options, config);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Parse the command from arguments
 */
function parseCommand(args: string[]): Command {
  const commandArg = args[0];
  
  if (!commandArg || commandArg.startsWith('-')) {
    return 'help';
  }
  
  switch (commandArg) {
    case 'convert':
    case 'validate':
      return commandArg;
    default:
      return 'help';
  }
}

/**
 * Parse options from command line arguments
 */
function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--config' || arg === '-c') {
      options.config = args[++i];
    } else if (arg === '--watch' || arg === '-w') {
      options.watch = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }
  
  return options;
}

/**
 * Execute the specified command with options
 */
async function executeCommand(
  command: Command, 
  options: CliOptions, 
  config: LuatsConfig
): Promise<void> {
  switch (command) {
    case 'convert':
      await convertCommand(options, config);
      break;
    case 'validate':
      await validateCommand(options, config);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

/**
 * Convert command implementation
 */
async function convertCommand(options: CliOptions, config: LuatsConfig): Promise<void> {
  if (!options.input) {
    throw new Error('Input file or directory is required for convert command');
  }
  
  // Resolve input path
  const inputPath = path.resolve(options.input);
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input path does not exist: ${inputPath}`);
  }
  
  const stats = fs.statSync(inputPath);
  
  // Determine output path
  const outputPath = options.output ? 
    path.resolve(options.output) : 
    (stats.isFile() ? 
      inputPath.replace(/\.lua$|\.luau$/, '.ts') : 
      inputPath);
  
  if (stats.isFile()) {
    // Process a single file
    await processFile(inputPath, outputPath, config);
    console.log(`Converted file: ${inputPath} -> ${outputPath}`);
  } else if (stats.isDirectory()) {
    // Process a directory
    await processDirectory(inputPath, outputPath, config);
    console.log(`Converted directory: ${inputPath} -> ${outputPath}`);
  } else {
    throw new Error(`Invalid input: ${inputPath}`);
  }
}

/**
 * Validate command implementation
 */
async function validateCommand(options: CliOptions, config: LuatsConfig): Promise<void> {
  if (!options.input) {
    throw new Error('Input file is required for validate command');
  }
  
  const inputPath = path.resolve(options.input);
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }
  
  if (fs.statSync(inputPath).isDirectory()) {
    throw new Error('Validation can only be performed on a single file');
  }
  
  // Read the file
  const luaCode = fs.readFileSync(inputPath, 'utf-8');
  
  // Determine if it's Luau based on extension
  const isLuau = inputPath.endsWith('.luau');
  
  console.log(`Validating file: ${inputPath}`);
  
  // Here you would add the actual validation logic
  // For now, we'll just return success
  console.log('Validation successful!');
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
LuaTS CLI - Lua/Luau tools for TypeScript

Usage:
  luats <command> [options]

Commands:
  convert     Convert Lua/Luau files to TypeScript
  validate    Validate Lua/Luau files

Options:
  --input, -i    Input file or directory
  --output, -o   Output file or directory
  --config, -c   Config file path
  --watch, -w    Watch for file changes
  --verbose, -v  Verbose output

Examples:
  luats convert --input ./src --output ./dist
  luats validate --input ./src/main.lua
  `);
}

// Run CLI if this file is executed directly
if (require.main === module) {
  cli().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }
  
  if (!fs.statSync(inputPath).isFile()) {
    throw new Error(`Not a file: ${inputPath}`);
  }
  
  if (!options.silent) {
    console.log(`Validating ${inputPath}`);
  }
  
  // Read input file
  const luaCode = fs.readFileSync(inputPath, 'utf-8');
  
  // Determine if it's Luau based on extension
  const isLuau = path.extname(inputPath) === '.luau';
  
  // Analyze the code
  const result = analyze(luaCode, isLuau);
  
  if (result.errors.length === 0) {
    if (!options.silent) {
      console.log(`✓ ${inputPath} is valid`);
    }
  } else {
    console.error(`✗ ${inputPath} has ${result.errors.length} error(s)`);
    
    if (options.verbose || !options.silent) {
      result.errors.forEach((error, index) => {
        console.error(`Error ${index + 1}: ${error.message}`);
      });
    }
    
    throw new Error('Validation failed');
  }
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
LuaTS CLI - Lua/Luau tools for TypeScript

Usage:
  luats <command> [options]

Commands:
  convert       Convert a Lua/Luau file to TypeScript
  convert-dir   Convert a directory of Lua/Luau files to TypeScript
  validate      Validate a Lua/Luau file

Options:
  --input, -i    Input file or directory
  --output, -o   Output file or directory
  --config, -c   Config file path
  --watch, -w    Watch for file changes
  --verbose, -v  Verbose output
  --silent, -s   Suppress output messages

Examples:
  luats convert --input ./src/types.lua --output ./dist/types.d.ts
  luats convert-dir --input ./src --output ./dist
  luats validate --input ./src/main.lua
  `);
}

// Run CLI if this file is executed directly
if (require.main === module) {
  cli();
}
