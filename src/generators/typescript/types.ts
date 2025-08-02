export interface TypeScriptInterface {
  name: string;
  properties: TypeScriptProperty[];
  extends?: string[];
  description?: string;
  comments?: any[];
}

export interface TypeScriptProperty {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  comments?: any[];
}

export interface TypeScriptType {
  name: string;
  type: string;
  description?: string;
  comments?: any[];
}

export interface TypeScriptParameter {
  name: string;
  type: string;
  optional: boolean;
  description?: string | undefined;
}

export interface TypeScriptFunction {
  name: string;
  parameters: TypeScriptParameter[];
  returnType: string;
  description?: string | undefined;
}

/**
 * Options for the TypeScript type generator
 */
export interface TypeGeneratorOptions {
  /**
   * Whether to use "unknown" instead of "any" for unspecified types
   * @default false
   */
  useUnknown?: boolean;
  
  /**
   * Prefix to add to all interface names
   * @default ""
   */
  interfacePrefix?: string;
  
  /**
   * Whether to include semicolons in the generated TypeScript
   * @default true
   */
  includeSemicolons?: boolean;
  
  /**
   * Legacy alias for includeSemicolons
   * @deprecated Use includeSemicolons instead
   */
  semicolons?: boolean;
  
  /**
   * Whether to preserve comments from the Lua code
   * @default true
   */
  preserveComments?: boolean;
  
  /**
   * Whether to generate comments in the output
   * @default true
   */
  generateComments?: boolean;
  
  /**
   * Style of comments to generate
   * @default "jsdoc"
   */
  commentStyle?: 'jsdoc' | 'inline';
}
