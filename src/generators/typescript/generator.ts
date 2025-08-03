import { TypeGeneratorOptions } from './types';

export class TypeGenerator {
  private options: TypeGeneratorOptions;
  protected interfaces = new Map<string, any>();
  protected types = new Map<string, any>();

  constructor(options: TypeGeneratorOptions = {}) {
    this.options = {
      useUnknown: false,
      interfacePrefix: '',
      includeSemicolons: options.semicolons ?? options.includeSemicolons ?? true,
      preserveComments: true,
      ...options
    };
  }

  public generateTypeScript(code: string): string {
    try {
      // Parse the Luau code
      const { LuauParser } = require('../../parsers/luau');
      const parser = new LuauParser();
      const ast = parser.parse(code);
      
      // Clear previous results
      this.interfaces.clear();
      this.types.clear();
      
      // Process the AST
      this.processAST(ast);
      
      // Generate TypeScript code
      return this.generateCode();
    } catch (error) {
      console.error('Error parsing code:', error);
      return '';
    }
  }

  private processAST(ast: any): void {
    if (!ast || !ast.body) return;
    
    for (const statement of ast.body) {
      if (statement.type === 'TypeAlias') {
        this.processTypeAlias(statement);
      }
    }
  }

  protected convertType(type: any): string {
    if (!type) return this.options.useUnknown ? 'unknown' : 'any';
    
    switch (type.type) {
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
      case 'ArrayType':
        return `${this.convertType(type.elementType)}[]`;
      case 'UnionType':
        return type.types.map((t: any) => this.convertType(t)).join(' | ');
      case 'IntersectionType':
        return type.types.map((t: any) => {
          const converted = this.convertType(t);
          // Wrap union types in parentheses when they're part of an intersection
          if (t.type === 'UnionType') {
            return `(${converted})`;
          }
          return converted;
        }).join(' & ');
      case 'FunctionType':
        const params = type.parameters?.map((p: any) => 
          `${p.name.name}: ${this.convertType(p.typeAnnotation?.typeAnnotation)}`
        ).join(', ') || '';
        const returnType = this.convertType(type.returnType);
        return `(${params}) => ${returnType}`;
      case 'GenericType':
        // FIXED: Handle string literals properly
        if (type.name.startsWith('"') && type.name.endsWith('"')) {
          return type.name; // Return string literals as-is: "GET", "POST", etc.
        }
        if (type.name === 'string' || type.name === 'number' || type.name === 'boolean') {
          return type.name;
        }
        return type.name;
        
      case 'TableType':
        if (type.properties?.length === 1 && type.properties[0].type === 'IndexSignature') {
          const prop = type.properties[0];
          const keyType = this.convertType(prop.keyType);
          const valueType = this.convertType(prop.valueType);
          return `Record<${keyType}, ${valueType}>`;
        }
        // Inline object type
        const props = type.properties?.map((p: any) => {
          if (p.type === 'PropertySignature') {
            const optional = p.optional ? '?' : '';
            return `${p.key.name}${optional}: ${this.convertType(p.typeAnnotation)}`;
          }
          return '';
        }).filter(Boolean).join(', ') || '';
        return `{ ${props} }`;
      default:
        return this.options.useUnknown ? 'unknown' : 'any';
    }
  }

  protected processTypeAlias(typeAlias: any): void {
    const name = typeAlias.name.name;
    const definition = typeAlias.definition;
    
    // Always create type aliases for union types, not interfaces
    if (definition.type === 'UnionType') {
      this.types.set(name, {
        name,
        type: this.convertType(definition),
        description: typeAlias.description,
        comments: typeAlias.comments
      });
    } else if (definition.type === 'TableType') {
      // Convert table type to interface
      const properties: any[] = [];
      
      if (definition.properties) {
        for (const prop of definition.properties) {
          if (prop.type === 'PropertySignature') {
            properties.push({
              name: prop.key.name,
              type: this.convertType(prop.typeAnnotation),
              optional: prop.optional || false,
              description: prop.description,
              comments: prop.comments
            });
          } else if (prop.type === 'IndexSignature') {
            // Handle index signatures like [string]: number
            const keyType = this.convertType(prop.keyType);
            const valueType = this.convertType(prop.valueType);
            properties.push({
              name: `[key: ${keyType}]`,
              type: valueType,
              optional: false,
              isIndexSignature: true
            });
          }
        }
      }
      
      this.interfaces.set(name, {
        name: this.options.interfacePrefix + name,
        properties,
        description: typeAlias.description,
        comments: typeAlias.comments
      });
    } else {
      // Convert other types to type aliases
      this.types.set(name, {
        name,
        type: this.convertType(definition),
        description: typeAlias.description,
        comments: typeAlias.comments
      });
    }
  }

  protected generateCode(): string {
    const parts: string[] = [];
    
    // Generate interfaces
    for (const [, iface] of this.interfaces) {
      let code = '';
      
      // Add comments if present
      if (iface.comments?.length) {
        code += this.formatComments(iface.comments);
      } else if (iface.description) {
        code += `/**\n * ${iface.description}\n */\n`;
      }
      
      code += `interface ${iface.name} {\n`;
      
      for (const prop of iface.properties) {
        if (prop.comments?.length) {
          code += `  ${this.formatComments(prop.comments, true)}`;
        }
        
        if (prop.isIndexSignature) {
          code += `  ${prop.name}: ${prop.type}`;
        } else {
          const optional = prop.optional ? '?' : '';
          code += `  ${prop.name}${optional}: ${prop.type}`;
        }
        
        if (this.options.includeSemicolons) {
          code += ';';
        }
        code += '\n';
      }
      
      code += '}';
      parts.push(code);
    }
    
    // Generate type aliases
    for (const [name, typeAlias] of this.types) {
      let code = '';
      
      // Add comments if present
      if (typeAlias.comments?.length) {
        code += this.formatComments(typeAlias.comments);
      } else if (typeAlias.description) {
        code += `/**\n * ${typeAlias.description}\n */\n`;
      }
      
      code += `type ${name} = ${typeAlias.type};`;
      parts.push(code);
    }
    
    return parts.join('\n\n');
  }

  private formatComments(comments: any[], inline = false): string {
    if (!comments?.length) return '';
    
    const prefix = inline ? '  ' : '';
    const lines = comments.map((c: any) => {
      let value = c.value || '';
      // Clean up comment markers
      value = value.replace(/^--\s*/, '').replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
      return value;
    });
    
    return `${prefix}/**\n${lines.map(l => `${prefix} * ${l}`).join('\n')}\n${prefix} */\n`;
  }

  // Legacy method for backward compatibility
  public generate(ast: any): string {
    this.interfaces.clear();
    this.types.clear();
    this.processAST(ast);
    return this.generateCode();
  }

  // Plugin system support methods
  public getAllInterfaces(): any[] {
    return Array.from(this.interfaces.values());
  }

  public addInterface(iface: any): void {
    this.interfaces.set(iface.name, iface);
  }
}