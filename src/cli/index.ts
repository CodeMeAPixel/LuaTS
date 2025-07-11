#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { analyze } from '../index.js';
import { processDirectory } from './processor.js';
import { loadConfig } from './config.js';
import type { LuatsConfig } from './config.js';

// CLI command types
type Command = 'convert' | 'convert-dir' | 'validate' | 'help';

// CLI options interface
interface CliOptions {
  input?: string;
  output?: string;
  config?: string;
  watch?: boolean;
  verbose?: boolean;
  silent?: boolean;
}

/**
 * Main CLI entry point
 */
export function cli(args: string[] = process.argv.slice(2)): void {
  try {
    const command = parseCommand(args);
    const options = parseOptions(args);
    
    executeCommand(command, options);
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
    case 'convert-dir':
    case 'validate':
      return commandArg as Command;
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
    } else if (arg === '--silent' || arg === '-s') {
      options.silent = true;
    }
  }
  
  return options;
}

/**
 * Execute the specified command with options
 */
async function executeCommand(command: Command, options: CliOptions): Promise<void> {
  // Load config if provided
  let config: LuatsConfig | undefined;
  
  if (options.config) {
    config = await loadConfig(options.config);
  }
  
  switch (command) {
    case 'convert':
      await convertCommand(options, config);
      break;
    case 'convert-dir':
      await convertDirectoryCommand(options, config);
      break;
    case 'validate':
      await validateCommand(options);
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

/**
 * Convert a single file
 */
async function convertCommand(options: CliOptions, config?: LuatsConfig): Promise<void> {
  if (!options.input) {
    throw new Error('Input file is required for convert command');
  }
  
  const inputPath = path.resolve(options.input);
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`File not found: ${inputPath}`);
  }
  
  if (!fs.statSync(inputPath).isFile()) {
    throw new Error(`Not a file: ${inputPath}`);
  }
  
  if (!options.output) {
    options.output = path.join(
      path.dirname(inputPath),
      path.basename(inputPath, path.extname(inputPath)) + '.d.ts'
    );
  }
  
  const outputPath = path.resolve(options.output);
  
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  if (!options.silent) {
    console.log(`Converting ${inputPath} -> ${outputPath}`);
  }
  
  // Read input file
  const luaCode = fs.readFileSync(inputPath, 'utf-8');
  
  // Convert to TypeScript
  const result = analyze(luaCode, true);
  
  if (result.errors.length > 0) {
    console.error(`Failed to analyze ${inputPath}:`);
    result.errors.forEach(error => console.error(`- ${error.message}`));
    throw new Error('Analysis failed with errors');
  }
  
  if (!result.types) {
    throw new Error('No TypeScript types were generated');
  }
  
  // Write output file
  fs.writeFileSync(outputPath, result.types, 'utf-8');
  
  if (!options.silent) {
    console.log(`Successfully converted ${inputPath}`);
  }
}

/**
 * Convert a directory of files
 */
async function convertDirectoryCommand(options: CliOptions, config?: LuatsConfig): Promise<void> {
  if (!options.input) {
    throw new Error('Input directory is required for convert-dir command');
  }
  
  const inputDir = path.resolve(options.input);
  
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Directory not found: ${inputDir}`);
  }
  
  if (!fs.statSync(inputDir).isDirectory()) {
    throw new Error(`Not a directory: ${inputDir}`);
  }
  
  const outputDir = options.output ? path.resolve(options.output) : inputDir;
  
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Process the directory
  await processDirectory(inputDir, outputDir, {
    pattern: '**/*.{lua,luau}',
    recursive: true,
    silent: options.silent || false,
    verbose: options.verbose || false,
    config: config || await loadConfig()
  });
}

/**
 * Validate a Lua/Luau file
 */
async function validateCommand(options: CliOptions): Promise<void> {
  if (!options.input) {
    throw new Error('Input file is required for validate command');
  }
  
  const inputPath = path.resolve(options.input);
  
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
