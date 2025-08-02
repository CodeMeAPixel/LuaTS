export interface TypeScriptInterface {
  name: string;
  properties: TypeScriptProperty[];
  extends?: string[];
  description?: string | undefined;
}

export interface TypeScriptProperty {
  name: string;
  type: string;
  optional: boolean;
  description?: string | undefined;
}

export interface TypeScriptType {
  name: string;
  type: string;
  description?: string | undefined;
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

export interface TypeGeneratorOptions {
  useUnknown?: boolean;
  interfacePrefix?: string;
  semicolons?: boolean;
  commentStyle?: 'jsdoc' | 'inline';
  generateComments?: boolean; // Add explicit option for comment generation
}
