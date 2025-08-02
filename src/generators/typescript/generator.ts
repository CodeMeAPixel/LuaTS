import { formatComments } from './utils';

import {
  TypeScriptInterface,
  TypeScriptProperty,
  TypeScriptType,
  TypeScriptFunction,
  TypeGeneratorOptions
} from './types';

export class TypeGenerator {
  private options: TypeGeneratorOptions;
  private interfaces: Map<string, TypeScriptInterface>;
  private types: Map<string, TypeScriptType>;
  private functions: Map<string, TypeScriptFunction>;

  constructor(options: TypeGeneratorOptions = {}) {
    this.options = options;
    this.interfaces = new Map();
    this.types = new Map();
    this.functions = new Map();
  }

  public generate(ast: any): string {
    this.interfaces.clear();
    this.types.clear();
    this.functions.clear();
    this.processNode(ast);
    return this.generateCode();
  }

  private processNode(node: any): void {
    if (!node) return;
    if (Array.isArray(node.body)) {
      for (const child of node.body) {
        this.processNode(child);
      }
    }
    if (node.type === 'TypeAlias') {
      let name: string | undefined;
      let value: any;
      let comments: any[] | undefined;
      if (node.id && node.value) {
        name = node.id.name;
        value = node.value;
        comments = node.comments;
      } else if (node.name && node.definition) {
        name = node.name.name || node.name;
        value = node.definition;
        comments = node.comments || node.comments;
      } else {
        return;
      }
      if (typeof name !== 'string') return;

      // --- Handle Record types as type aliases ---
      if (
        value.type === 'TableType' &&
        value.fields &&
        value.fields.length === 1 &&
        (value.fields[0].key === 'string' || value.fields[0].key === 'number')
      ) {
        const keyType = value.fields[0].key === 'string' ? 'string' : 'number';
        const tsType: TypeScriptType = {
          name,
          type: `Record<${keyType}, ${this.getTypeString(value.fields[0].valueType)}>`,

          description: comments ? formatComments(comments) : undefined
        };
        this.types.set(name, tsType);
        return;
      }

      // --- Handle function type aliases as type ---
      if (value.type === 'FunctionType') {
        const params = (value.parameters || []).filter((p: any, idx: number) => {
          const n = p.name?.name || p.name;
          return !(idx === 0 && n === 'self');
        }).map((p: any) => {
          const n = p.name?.name || p.name;
          const t = p.typeAnnotation
            ? this.getTypeString(p.typeAnnotation.typeAnnotation)
            : (this.options.useUnknown ? 'unknown' : 'any');
          return `${n}: ${t}`;
        });
        let ret: string;
        if (value.returnType) {
          ret = this.getTypeString(value.returnType);
        } else {
          ret = this.options.useUnknown ? 'unknown' : 'any';
        }
        const tsType: TypeScriptType = {
          name,
          type: `(${params.join(', ')}) => ${ret}`,
          description: comments ? formatComments(comments) : undefined
        };
        this.types.set(name, tsType);
        return;
      }

      // --- Handle normal interfaces ---
      if (value.type === 'TableType') {
        const tsInterface: TypeScriptInterface = {
          name,
          properties: [],
          description: comments ? formatComments(comments) : undefined
        };
        if (value.fields) {
          for (const field of value.fields) {
            const property: TypeScriptProperty = {
              name: field.name?.name || field.key || '',
              type: this.getTypeString(field.valueType),
              optional: field.optional || false,
              // Attach field comments if present
              description: field.comments ? formatComments(field.comments) : undefined
            };
            tsInterface.properties.push(property);
          }
        }
        this.interfaces.set(name, tsInterface);
        return;
      }

      // --- Handle union types ---
      if (value.type === 'UnionType') {
        const tsType: TypeScriptType = {
          name,
          type: this.getTypeString(value),
          description: comments ? formatComments(comments) : undefined
        };
        this.types.set(name, tsType);
        return;
      }

      // --- Handle simple type aliases ---
      const tsType: TypeScriptType = {
        name,
        type: this.getTypeString(value),
        description: comments ? formatComments(comments) : undefined
      };
      this.types.set(name, tsType);
    }
  }

  private generateCode(): string {
    let code = '';
    for (const tsInterface of this.interfaces.values()) {
      // Only output interface if it has properties
      if (tsInterface.properties.length > 0) {
        code += this.generateInterface(tsInterface);
        code += '\n\n';
      }
    }
    for (const tsType of this.types.values()) {
      code += this.generateType(tsType);
      code += '\n\n';
    }
    for (const tsFunction of this.functions.values()) {
      code += this.generateFunctionType(tsFunction);
      code += '\n\n';
    }
    return code.trim();
  }

  private generateInterface(tsInterface: TypeScriptInterface): string {
    let code = '';
    // Output interface description as JSDoc if present
    if (tsInterface.description) {
      code += `${tsInterface.description}\n`;
    }
    let interfaceName = tsInterface.name;
    if (this.options.interfacePrefix && !interfaceName.startsWith(this.options.interfacePrefix)) {
      interfaceName = `${this.options.interfacePrefix}${interfaceName}`;
    }
    code += `interface ${interfaceName}`;
    if (tsInterface.extends && tsInterface.extends.length > 0) {
      code += ` extends ${tsInterface.extends.join(', ')}`;
    }
    code += ' {\n';
    for (const property of tsInterface.properties) {
      // Output property description as JSDoc if present
      if (property.description) {
        code += `  ${property.description}\n`;
      }
      code += `  ${property.name}${property.optional ? '?' : ''}: ${property.type}`;
      if (this.options.semicolons !== false) {
        code += ';';
      }
      code += '\n';
    }
    code += '}';
    return code;
  }

  private generateType(tsType: TypeScriptType): string {
    let code = '';
    // Output type description as JSDoc if present
    if (tsType.description) {
      code += `${tsType.description}\n`;
    }
    code += `type ${tsType.name} = ${tsType.type}`;
    if (this.options.semicolons !== false) {
      code += ';';
    }
    return code;
  }

  private generateFunctionType(tsFunction: TypeScriptFunction): string {
    let code = '';
    if (tsFunction.description) {
      code += `${tsFunction.description}\n`;
    }
    const params = tsFunction.parameters.map(param =>
      `${param.name}${param.optional ? '?' : ''}: ${param.type}`
    ).join(', ');
    code += `type ${tsFunction.name} = (${params}) => ${tsFunction.returnType}`;
    if (this.options.semicolons !== false) {
      code += ';';
    }
    return code;
  }

  public addInterface(tsInterface: TypeScriptInterface): void {
    this.interfaces.set(tsInterface.name, tsInterface);
  }

  public getInterface(name: string): TypeScriptInterface | undefined {
    return this.interfaces.get(name);
  }

  public getAllInterfaces(): TypeScriptInterface[] {
    return Array.from(this.interfaces.values());
  }

  private getTypeString(typeNode: any): string {
    if (!typeNode) return this.options.useUnknown ? 'unknown' : 'any';
    switch (typeNode.type) {
      case 'StringType': return 'string';
      case 'NumberType': return 'number';
      case 'BooleanType': return 'boolean';
      case 'NilType': return 'null';
      case 'AnyType': return this.options.useUnknown ? 'unknown' : 'any';
      case 'GenericType':
        if (typeNode.typeParameters && typeNode.typeParameters.length > 0) {
          return `${typeNode.name}<${typeNode.typeParameters.map((t: any) => this.getTypeString(t)).join(', ')}>`;
        }
        return typeNode.name;
      case 'UnionType':
        return typeNode.types.map((t: any) => this.getTypeString(t)).join(' | ');
      case 'IntersectionType':
        return typeNode.types.map((t: any) => this.getTypeString(t)).join(' & ');
      case 'FunctionType': {
        const params = (typeNode.parameters || []).filter((p: any, idx: number) => {
          const n = p.name?.name || p.name;
          return !(idx === 0 && n === 'self');
        }).map((p: any) => {
          const n = p.name?.name || p.name;
          const t = p.typeAnnotation
            ? this.getTypeString(p.typeAnnotation.typeAnnotation)
            : (this.options.useUnknown ? 'unknown' : 'any');
          return `${n}: ${t}`;
        });
        // Fix: Only use 'any'/'unknown' if returnType is truly missing
        let ret: string;
        if (typeNode.returnType) {
          ret = this.getTypeString(typeNode.returnType);
        } else {
          ret = this.options.useUnknown ? 'unknown' : 'any';
        }
        return `(${params.join(', ')}) => ${ret}`;
      }
      case 'TableType': {
        // Array: {T}
        if (typeNode.fields.length === 1 && typeNode.fields[0].key === 1) {
          return this.getTypeString(typeNode.fields[0].valueType) + '[]';
        }
        // Record: {[string]: T} or {[number]: T}
        if (
          typeNode.fields.length === 1 &&
          typeNode.fields[0].key !== undefined &&
          (typeNode.fields[0].key === 'string' || typeNode.fields[0].key === 'number')
        ) {
          const keyType = typeNode.fields[0].key === 'string' ? 'string' : 'number';
          return `Record<${keyType}, ${this.getTypeString(typeNode.fields[0].valueType)}>`;
        }
        // Object
        return '{ ' + typeNode.fields.map((f: any) =>
          `${f.key}${f.optional ? '?' : ''}: ${this.getTypeString(f.valueType)}`
        ).join(', ') + ' }';
      }
      default:
        return this.options.useUnknown ? 'unknown' : 'any';
    }
  }

  // For test compatibility: generate TypeScript from code or AST.
  public generateTypeScript(codeOrAst: string | any): string {
    let ast: any;
    if (typeof codeOrAst === 'string') {
      try {
        const { LuauParser } = require('../parsers/luau');
        ast = new LuauParser().parse(codeOrAst);
      } catch {
        ast = { type: 'Program', body: [] };
      }
    } else {
      ast = codeOrAst;
    }
    this.interfaces.clear();
    this.types.clear();
    this.functions.clear();
    this.processNode(ast);
    return this.generateCode();
  }
}