import fs from 'fs';
import path from 'path';
import { TypeGeneratorOptions, defaultTypeGeneratorOptions } from '../generators/typescript.js';

export interface LuatsConfig {
  // TypeScript generator options
  typeGeneratorOptions: TypeGeneratorOptions;
  
  // File patterns
  include: string[];
  exclude: string[];
  
  // Output options
  outDir: string | null;
  preserveDirectoryStructure: boolean;
  
  // Plugin support
  plugins: string[];
  
  // Comment processing
  preserveComments: boolean;
  commentStyle: 'jsdoc' | 'inline' | 'both';
  
  // Type inference options
  inferTypes: boolean;
  mergeInterfaces: boolean;
}

export const defaultConfig: LuatsConfig = {
  typeGeneratorOptions: defaultTypeGeneratorOptions,
  include: ['**/*.{lua,luau}'],
  exclude: ['**/node_modules/**', '**/dist/**'],
  outDir: null, // Same as input if null
  preserveDirectoryStructure: true,
  plugins: [],
  preserveComments: true,
  commentStyle: 'jsdoc',
  inferTypes: false,
  mergeInterfaces: true
};

/**
 * Load configuration from a file, with fallbacks
 */
export async function loadConfig(configPath?: string): Promise<LuatsConfig> {
  // Try to find the config file
  const filePath = configPath ? path.resolve(configPath) : findConfigFile();
  
  // Start with the default config
  let config: LuatsConfig = { ...defaultConfig };
  
  // Load from file if found
  if (filePath && fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileConfig = JSON.parse(fileContent);
      
      // Merge configs, ensuring defaults for any missing properties
      config = mergeConfigs(config, fileConfig);
      
      console.log(`Loaded configuration from ${filePath}`);
    } catch (error) {
      console.warn(`Error loading config from ${filePath}:`, error);
      console.warn('Using default configuration');
    }
  } else if (configPath) {
    // Only warn if a specific path was provided but not found
    console.warn(`Config file not found: ${configPath}`);
    console.warn('Using default configuration');
  }
  
  return config;
}

/**
 * Find a configuration file in the current or parent directories
 */
function findConfigFile(): string | null {
  const configNames = ['luats.config.json', '.luatsrc.json', '.luatsrc'];
  let currentDir = process.cwd();
  
  // Try to find config in current dir or any parent dir
  while (true) {
    for (const name of configNames) {
      const configPath = path.join(currentDir, name);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    
    // Go up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // We've reached the root
      break;
    }
    currentDir = parentDir;
  }
  
  return null;
}

/**
 * Merge configurations, preserving defaults for missing properties
 */
function mergeConfigs(baseConfig: LuatsConfig, userConfig: Partial<LuatsConfig>): LuatsConfig {
  // Deep merge of the configs
  const result: LuatsConfig = { ...baseConfig };
  
  // Handle top-level properties
  Object.keys(userConfig).forEach(key => {
    const typedKey = key as keyof LuatsConfig;
    const userValue = userConfig[typedKey];
    
    // Special handling for objects that need deep merging
    if (typedKey === 'typeGeneratorOptions' && userValue) {
      result.typeGeneratorOptions = {
        ...baseConfig.typeGeneratorOptions,
        ...(userValue as Partial<TypeGeneratorOptions>)
      };
    } else if (userValue !== undefined) {
      // For other properties, use the user value if defined
      (result as any)[key] = userValue;
    }
  });
  
  return result;
}
}
