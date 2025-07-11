#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { processDirectory, processFile } from './processor';
import { LuatsConfig, loadConfig } from './config';
import { LuaParser } from '../parsers/lua';
import { LuauParser } from '../parsers/luau';

// CLI command types
type Command = 'convert' | 'validate' | 'help';

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
    } else if (arg === '--silent' || arg === '-s') {
      options.silent = true;
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
    if (!options.silent) {
      console.log(`Converted file: ${inputPath} -> ${outputPath}`);
    }
  } else if (stats.isDirectory()) {
    // Process a directory
    await processDirectory(inputPath, outputPath, config);
    if (!options.silent) {
      console.log(`Converted directory: ${inputPath} -> ${outputPath}`);
    }
  } else {
    throw new Error(`Invalid input: ${inputPath}`);
  }
}

/**
 * Validate command implementation
 */
async function validateCommand(options: CliOptions, _config: LuatsConfig): Promise<void> {
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

  const code = fs.readFileSync(inputPath, 'utf-8');
  const isLuau = inputPath.endsWith('.luau');
  let parser, errors = [];

  try {
    parser = isLuau ? new LuauParser() : new LuaParser();
    parser.parse(code);
  } catch (err: any) {
    errors.push(err.message || String(err));
  }

  if (!options.silent) {
    if (errors.length > 0) {
      console.error(`❌ Validation failed for ${inputPath}:`);
      errors.forEach((msg, i) => console.error(`  ${i + 1}. ${msg}`));
      process.exit(1);
    } else {
      console.log(`✓ ${inputPath} is valid`);
    }
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
  convert     Convert Lua/Luau files to TypeScript
  validate    Validate Lua/Luau files

Options:
  --input, -i    Input file or directory
  --output, -o   Output file or directory
  --config, -c   Config file path
  --watch, -w    Watch for file changes
  --verbose, -v  Verbose output
  --silent, -s   Suppress output messages

Examples:
  luats convert --input ./src/types.lua --output ./dist/types.d.ts
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