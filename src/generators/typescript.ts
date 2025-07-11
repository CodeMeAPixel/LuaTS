import * as AST from '../types';

export interface TypeGeneratorOptions {
  moduleType?: 'esm' | 'commonjs';
  inferTypes?: boolean;
  strictNullChecks?: boolean;
  robloxTypes?: boolean;
  preserveComments?: boolean;
  commentStyle?: 'jsdoc' | 'tsdoc' | 'inline';
}

export interface TypeScriptProperty {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface TypeScriptInterface {
  name: string;
  properties: TypeScriptProperty[];
  extends?: string[];
  description?: string;
}

export const defaultTypeGeneratorOptions: TypeGeneratorOptions = {
  moduleType: 'esm',
  inferTypes: true,
  strictNullChecks: true,
  robloxTypes: false,
  preserveComments: true,
  commentStyle: 'jsdoc'
};

export class TypeGenerator {
  private options: TypeGeneratorOptions;

  constructor(options: Partial<TypeGeneratorOptions> = {}) {
    this.options = { ...defaultTypeGeneratorOptions, ...options };
  }

  /**
   * Generate TypeScript code from a Lua AST
   */
  public generateFromLuaAST(ast: AST.Program): string {
    // Placeholder implementation
    return `// TypeScript code generated from Lua AST
// Options: ${JSON.stringify(this.options)}

/**
 * This is a placeholder implementation
 */
export interface LuaModule {
  // Add your generated types here
}
`;
  }

  /**
   * Generate TypeScript code from a Luau AST
   */
  public generateFromLuauAST(ast: AST.Program): string {
    // Placeholder implementation
    return `// TypeScript code generated from Luau AST
// Options: ${JSON.stringify(this.options)}

/**
 * This is a placeholder implementation
 */
export interface LuauModule {
  // Add your generated types here
}
`;
  }
}
  public generateFromTableType(tableName: string, tableType: AST.TableType): TypeScriptInterface {
    const properties: TypeScriptProperty[] = [];
    
    for (const field of tableType.fields) {
      properties.push({
        name: field.key.toString(),
        type: this.convertLuauTypeToTypeScript(field.valueType),
        optional: field.optional || false,
        readonly: this.options.useReadonly,
      });
    }
    
    return {
      name: tableName,
      properties,
    };
  }

  // Made public to allow plugins to extend it
  public processTypeAlias(typeAlias: AST.TypeAlias): void {
    const name = typeAlias.name.name;
    
    if (typeAlias.definition.type === 'TableType') {
      const tsInterface = this.generateFromTableType(name, typeAlias.definition);
      
      if (typeAlias.typeParameters) {
        tsInterface.generics = typeAlias.typeParameters;
      }
      
      this.interfaces.set(name, tsInterface);
    }
  }

  // Made public to allow plugins to extend it
  public convertLuauTypeToTypeScript(luauType: AST.LuauType): string {
    switch (luauType.type) {
      case 'StringType':
        return 'string';
      case 'NumberType':
        return 'number';
      case 'BooleanType':
        return 'boolean';
      case 'NilType':
        return 'null';
      case 'AnyType':
        return this.options.useUnknown ? 'unknown' : 'any';
      case 'UnionType':
        return luauType.types
          .map(t => this.convertLuauTypeToTypeScript(t))
          .join(' | ');
      case 'IntersectionType':
        return luauType.types
          .map(t => this.convertLuauTypeToTypeScript(t))
          .join(' & ');
      case 'FunctionType':
        return this.convertFunctionType(luauType);
      case 'TableType':
        return this.convertTableType(luauType);
      case 'GenericType':
        return this.convertGenericType(luauType);
      default:
        return this.options.useUnknown ? 'unknown' : 'any';
    }
  }

  private convertFunctionType(functionType: AST.FunctionType): string {
    const params = functionType.parameters
      .map((param: AST.Parameter) => {
        const type = param.typeAnnotation 
          ? this.convertLuauTypeToTypeScript(param.typeAnnotation.typeAnnotation)
          : (this.options.useUnknown ? 'unknown' : 'any');
        return `${param.name.name}: ${type}`;
      })
      .join(', ');
    
    const returnType = functionType.returnType
      ? this.convertLuauTypeToTypeScript(functionType.returnType)
      : 'void';
    
    return `(${params}) => ${returnType}`;
  }

  private convertTableType(tableType: AST.TableType): string {
    const properties = tableType.fields
      .map((field: AST.TableTypeField) => {
        const optional = field.optional ? '?' : '';
        const readonly = this.options.useReadonly ? 'readonly ' : '';
        const type = this.convertLuauTypeToTypeScript(field.valueType);
        return `  ${readonly}${field.key}${optional}: ${type}`;
      })
      .join(';\n');
    
    return `{\n${properties}\n}`;
  }

  private convertGenericType(genericType: AST.GenericType): string {
    if (genericType.typeParameters && genericType.typeParameters.length > 0) {
      const params = genericType.typeParameters
        .map((param: AST.LuauType) => this.convertLuauTypeToTypeScript(param))
        .join(', ');
      return `${genericType.name}<${params}>`;
    }
    
    return genericType.name;
  }

  // Made public to allow plugins to extend it
  public generateTypeScriptCode(): string {
    const lines: string[] = [];
    
    if (this.options.generateComments) {
      lines.push('// Generated TypeScript interfaces from Luau types');
      lines.push('// This file was automatically generated. Do not edit manually.');
      lines.push('');
    }
    
    for (const tsInterface of this.interfaces.values()) {
      lines.push(...this.generateInterfaceCode(tsInterface));
      lines.push('');
    }
    
    return lines.join('\n');
  }

  private generateInterfaceCode(tsInterface: TypeScriptInterface): string[] {
    const lines: string[] = [];
    
    if (this.options.generateComments) {
      lines.push(`/**`);
      lines.push(` * Interface for ${tsInterface.name}`);
      lines.push(` */`);
    }
    
    let interfaceDeclaration = '';
    if (this.options.exportTypes) {
      interfaceDeclaration += 'export ';
    }
    
    interfaceDeclaration += `interface ${tsInterface.name}`;
    
    if (tsInterface.generics && tsInterface.generics.length > 0) {
      interfaceDeclaration += `<${tsInterface.generics.join(', ')}>`;
    }
    
    if (tsInterface.extends && tsInterface.extends.length > 0) {
      interfaceDeclaration += ` extends ${tsInterface.extends.join(', ')}`;
    }
    
    interfaceDeclaration += ' {';
    lines.push(interfaceDeclaration);
    
    for (const property of tsInterface.properties) {
      let propertyLine = '  ';
      
      if (property.readonly) {
        propertyLine += 'readonly ';
      }
      
      propertyLine += property.name;
      
      if (property.optional) {
        propertyLine += '?';
      }
      
      propertyLine += `: ${property.type};`;
      lines.push(propertyLine);
    }
    
    lines.push('}');
    
    return lines;
  }

  public addCustomInterface(tsInterface: TypeScriptInterface): void {
    this.interfaces.set(tsInterface.name, tsInterface);
  }

  public getInterface(name: string): TypeScriptInterface | undefined {
    return this.interfaces.get(name);
  }

  public getAllInterfaces(): TypeScriptInterface[] {
    return Array.from(this.interfaces.values());
  }

  public generateLuaStandardLibraryTypes(): string {
    // Generate TypeScript interfaces for common Lua standard library functions
    const stdLib: TypeScriptInterface[] = [
      {
        name: 'LuaTable',
        properties: [
          { name: '[key: string]', type: 'any', optional: false },
          { name: '[key: number]', type: 'any', optional: false },
        ],
      },
      {
        name: 'LuaStringLib',
        properties: [
          { name: 'find', type: '(s: string, pattern: string, init?: number, plain?: boolean) => [number, number] | null', optional: false },
          { name: 'sub', type: '(s: string, i: number, j?: number) => string', optional: false },
          { name: 'gsub', type: '(s: string, pattern: string, repl: string | LuaTable | ((match: string) => string), n?: number) => [string, number]', optional: false },
          { name: 'len', type: '(s: string) => number', optional: false },
          { name: 'lower', type: '(s: string) => string', optional: false },
          { name: 'upper', type: '(s: string) => string', optional: false },
          { name: 'reverse', type: '(s: string) => string', optional: false },
          { name: 'format', type: '(formatstring: string, ...args: any[]) => string', optional: false },
        ],
      },
      {
        name: 'LuaTableLib',
        properties: [
          { name: 'insert', type: '(table: LuaTable, pos?: number, value?: any) => void', optional: false },
          { name: 'remove', type: '(table: LuaTable, pos?: number) => any', optional: false },
          { name: 'sort', type: '(table: LuaTable, comp?: (a: any, b: any) => boolean) => void', optional: false },
          { name: 'concat', type: '(table: LuaTable, sep?: string, i?: number, j?: number) => string', optional: false },
        ],
      },
      {
        name: 'LuaMathLib',
        properties: [
          { name: 'abs', type: '(x: number) => number', optional: false },
          { name: 'acos', type: '(x: number) => number', optional: false },
          { name: 'asin', type: '(x: number) => number', optional: false },
          { name: 'atan', type: '(y: number, x?: number) => number', optional: false },
          { name: 'ceil', type: '(x: number) => number', optional: false },
          { name: 'cos', type: '(x: number) => number', optional: false },
          { name: 'deg', type: '(x: number) => number', optional: false },
          { name: 'exp', type: '(x: number) => number', optional: false },
          { name: 'floor', type: '(x: number) => number', optional: false },
          { name: 'log', type: '(x: number, base?: number) => number', optional: false },
          { name: 'max', type: '(...args: number[]) => number', optional: false },
          { name: 'min', type: '(...args: number[]) => number', optional: false },
          { name: 'pow', type: '(x: number, y: number) => number', optional: false },
          { name: 'rad', type: '(x: number) => number', optional: false },
          { name: 'random', type: '(m?: number, n?: number) => number', optional: false },
          { name: 'sin', type: '(x: number) => number', optional: false },
          { name: 'sqrt', type: '(x: number) => number', optional: false },
          { name: 'tan', type: '(x: number) => number', optional: false },
          { name: 'pi', type: 'number', optional: false },
        ],
      },
    ];

    for (const lib of stdLib) {
      this.addCustomInterface(lib);
    }

    return this.generateTypeScriptCode();
  }

  /**
   * Extract comments from the AST and associate them with declarations
   */
  private extractComments(_ast: AST.Program): void {
    // This would require enhancing the AST to include comment tokens
    // For a complete implementation, we'd need to:
    // 1. Modify the parser to preserve comment tokens
    // 2. Associate comments with nearby declarations based on position
    // 3. Store these associations for use during TypeScript generation
    
    // For now, this is a placeholder for future implementation
  }
}
