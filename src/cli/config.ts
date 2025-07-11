import * as fs from 'fs';
import * as path from 'path';

/**
 * LuaTS Configuration interface
 */
export interface LuatsConfig {
  // Input/output configuration
  input?: string;
  output?: string;
  
  // Processing options
  include?: string[];
  exclude?: string[];
  
  // Parser options
  parserOptions?: {
    luaVersion?: '5.1' | '5.2' | '5.3' | '5.4' | 'luau';
    locations?: boolean;
    comments?: boolean;
    scope?: boolean;
  };
  
  // Formatter options
  formatterOptions?: {
    indentSize?: number;
    lineWidth?: number;
    useTabs?: boolean;
    newLineAtEnd?: boolean;
  };
  
  // Type generator options
  typeGeneratorOptions?: {
    moduleType?: 'esm' | 'commonjs';
    inferTypes?: boolean;
    strictNullChecks?: boolean;
    robloxTypes?: boolean;
  };
  
  // Plugin configuration
  plugins?: string[];
  
  // Logging options
  verbose?: boolean;
}

/**
 * Default configuration values
 */
export const defaultConfig: LuatsConfig = {
  include: ['**/*.{lua,luau}'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  
  parserOptions: {
    luaVersion: '5.1',
    locations: true,
    comments: true,
    scope: true
  },
  
  formatterOptions: {
    indentSize: 2,
    lineWidth: 80,
    useTabs: false,
    newLineAtEnd: true
  },
  
  typeGeneratorOptions: {
    moduleType: 'esm',
    inferTypes: true,
    strictNullChecks: true,
    robloxTypes: false
  },
  
  plugins: [],
  
  verbose: false
};

/**
 * Configuration file names to look for
 */
const CONFIG_FILE_NAMES = [
  '.luatsrc',
  '.luatsrc.json',
  '.luatsrc.js',
  'luats.config.js',
  'luats.config.json'
];

/**
 * Load configuration from file
 */
export async function loadConfig(configPath?: string): Promise<LuatsConfig> {
  // If config path is specified, try to load it
  if (configPath) {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    return loadConfigFile(configPath);
  }
  
  // Otherwise search for config files
  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
      return loadConfigFile(filePath);
    }
  }
  
  // Return default config if no config file found
  return { ...defaultConfig };
}

/**
 * Load and parse a configuration file
 */
async function loadConfigFile(filePath: string): Promise<LuatsConfig> {
  const ext = path.extname(filePath);
  
  try {
    if (ext === '.js') {
      // For JS files, require the module
      const config = require(filePath);
      return mergeWithDefaultConfig(config);
    } else {
      // For JSON files, read and parse
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      return mergeWithDefaultConfig(config);
    }
  } catch (error) {
    throw new Error(`Failed to load config file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Merge user config with default config
 */
function mergeWithDefaultConfig(userConfig: LuatsConfig): LuatsConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    parserOptions: {
      ...defaultConfig.parserOptions,
      ...userConfig.parserOptions
    },
    formatterOptions: {
      ...defaultConfig.formatterOptions,
      ...userConfig.formatterOptions
    },
    typeGeneratorOptions: {
      ...defaultConfig.typeGeneratorOptions,
      ...userConfig.typeGeneratorOptions
    }
  };
}
