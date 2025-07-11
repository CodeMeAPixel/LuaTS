import * as AST from '../types';

export interface FormatterOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
  insertFinalNewline: boolean;
  trimTrailingWhitespace: boolean;
  insertSpaceAfterComma: boolean;
  insertSpaceAroundOperators: boolean;
  insertSpaceAfterKeywords: boolean;
}

export const defaultFormatterOptions: FormatterOptions = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 80,
  insertFinalNewline: true,
  trimTrailingWhitespace: true,
  insertSpaceAfterComma: true,
  insertSpaceAroundOperators: true,
  insertSpaceAfterKeywords: true,
};

export class LuaFormatter {
  private options: FormatterOptions;
  private indentLevel: number = 0;
  private output: string[] = [];

  constructor(options: Partial<FormatterOptions> = {}) {
    this.options = { ...defaultFormatterOptions, ...options };
  }

  public format(node: AST.Program | string): string {
    this.output = [];
    this.indentLevel = 0;
    let ast: AST.Program;
    if (typeof node === 'string') {
      // Try to parse as Lua
      try {
        const { LuaParser } = require('../parsers/lua');
        ast = new LuaParser().parse(node);
      } catch {
        return '';
      }
    } else {
      ast = node;
    }
    if (!ast || !Array.isArray(ast.body)) return '';
    this.visitProgram(ast);

    let result = this.output.join('');

    if (this.options.trimTrailingWhitespace) {
      result = result.replace(/[ \t]+$/gm, '');
    }

    if (this.options.insertFinalNewline && !result.endsWith('\n')) {
      result += '\n';
    }

    return result;
  }

  private indent(): string {
    const indentChar = this.options.useTabs ? '\t' : ' '.repeat(this.options.indentSize);
    return indentChar.repeat(this.indentLevel);
  }

  private write(text: string): void {
    this.output.push(text);
  }

  private writeLine(text: string = ''): void {
    this.write(text + '\n');
  }

  private writeIndented(text: string): void {
    this.write(this.indent() + text);
  }

  private writeIndentedLine(text: string = ''): void {
    this.writeIndented(text);
    this.write('\n');
  }

  private visitProgram(node: AST.Program): void {
    for (let i = 0; i < node.body.length; i++) {
      this.visitStatement(node.body[i]);
      if (i < node.body.length - 1) {
        this.write('\n');
      }
    }
  }

  private visitStatement(node: AST.Statement): void {
    switch (node.type) {
      case 'LocalStatement':
        this.visitLocalStatement(node);
        break;
      case 'AssignmentStatement':
        this.visitAssignmentStatement(node);
        break;
      case 'FunctionDeclaration':
        this.visitFunctionDeclaration(node);
        break;
      case 'IfStatement':
        this.visitIfStatement(node);
        break;
      case 'WhileStatement':
        this.visitWhileStatement(node);
        break;
      case 'ForStatement':
        this.visitForStatement(node);
        break;
      case 'ReturnStatement':
        this.visitReturnStatement(node);
        break;
      case 'BreakStatement':
        this.visitBreakStatement(node);
        break;
      case 'ExpressionStatement':
        this.visitExpressionStatement(node);
        break;
      default:
        throw new Error(`Unknown statement type: ${(node as any).type}`);
    }
  }

  private visitLocalStatement(node: AST.LocalStatement): void {
    this.writeIndented('local ');
    
    for (let i = 0; i < node.variables.length; i++) {
      this.visitExpression(node.variables[i]);
      if (i < node.variables.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
    
    if (node.init && node.init.length > 0) {
      this.write(' = ');
      for (let i = 0; i < node.init.length; i++) {
        this.visitExpression(node.init[i]);
        if (i < node.init.length - 1) {
          this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
        }
      }
    }
  }

  private visitAssignmentStatement(node: AST.AssignmentStatement): void {
    this.writeIndented('');
    
    for (let i = 0; i < node.variables.length; i++) {
      this.visitExpression(node.variables[i]);
      if (i < node.variables.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
    
    this.write(' = ');
    
    for (let i = 0; i < node.init.length; i++) {
      this.visitExpression(node.init[i]);
      if (i < node.init.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
  }

  private visitFunctionDeclaration(node: AST.FunctionDeclaration): void {
    this.writeIndented('');
    
    if (node.isLocal) {
      this.write('local ');
    }
    
    this.write('function');
    
    if (node.identifier) {
      this.write(' ');
      this.visitExpression(node.identifier);
    }
    
    this.write('(');
    
    for (let i = 0; i < node.parameters.length; i++) {
      this.visitExpression(node.parameters[i]);
      if (i < node.parameters.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
    
    this.writeLine(')');
    
    this.indentLevel++;
    for (const stmt of node.body) {
      this.visitStatement(stmt);
      this.write('\n');
    }
    this.indentLevel--;
    
    this.writeIndented('end');
  }

  private visitIfStatement(node: AST.IfStatement): void {
    this.writeIndented('if ');
    this.visitExpression(node.test);
    this.writeLine(' then');
    
    this.indentLevel++;
    for (const stmt of node.consequent) {
      this.visitStatement(stmt);
      this.write('\n');
    }
    this.indentLevel--;
    
    if (node.alternate) {
      if (Array.isArray(node.alternate)) {
        this.writeIndentedLine('else');
        this.indentLevel++;
        for (const stmt of node.alternate) {
          this.visitStatement(stmt);
          this.write('\n');
        }
        this.indentLevel--;
      } else {
        this.writeIndented('else');
        this.visitIfStatement(node.alternate);
        return; // Don't write 'end' as it will be handled by the recursive call
      }
    }
    
    this.writeIndented('end');
  }

  private visitWhileStatement(node: AST.WhileStatement): void {
    this.writeIndented('while ');
    this.visitExpression(node.test);
    this.writeLine(' do');
    
    this.indentLevel++;
    for (const stmt of node.body) {
      this.visitStatement(stmt);
      this.write('\n');
    }
    this.indentLevel--;
    
    this.writeIndented('end');
  }

  private visitForStatement(node: AST.ForStatement): void {
    this.writeIndented('for ');
    this.visitExpression(node.variable);
    this.write(' = ');
    this.visitExpression(node.start);
    this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
    this.visitExpression(node.end);
    
    if (node.step) {
      this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      this.visitExpression(node.step);
    }
    
    this.writeLine(' do');
    
    this.indentLevel++;
    for (const stmt of node.body) {
      this.visitStatement(stmt);
      this.write('\n');
    }
    this.indentLevel--;
    
    this.writeIndented('end');
  }

  private visitReturnStatement(node: AST.ReturnStatement): void {
    this.writeIndented('return');
    
    if (node.arguments.length > 0) {
      this.write(' ');
      for (let i = 0; i < node.arguments.length; i++) {
        this.visitExpression(node.arguments[i]);
        if (i < node.arguments.length - 1) {
          this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
        }
      }
    }
  }

  private visitBreakStatement(_node: AST.BreakStatement): void {
    this.writeIndented('break');
  }

  private visitExpressionStatement(node: AST.ExpressionStatement): void {
    this.writeIndented('');
    this.visitExpression(node.expression);
  }

  private visitExpression(node: AST.Expression): void {
    switch (node.type) {
      case 'Nil':
        this.write('nil');
        break;
      case 'Boolean':
        this.write(node.value ? 'true' : 'false');
        break;
      case 'Number':
        this.write(node.value.toString());
        break;
      case 'String':
        this.write(`"${node.value}"`);
        break;
      case 'Identifier':
        this.write(node.name);
        break;
      case 'BinaryExpression':
        this.visitBinaryExpression(node);
        break;
      case 'UnaryExpression':
        this.visitUnaryExpression(node);
        break;
      case 'CallExpression':
        this.visitCallExpression(node);
        break;
      case 'MemberExpression':
        this.visitMemberExpression(node);
        break;
      case 'IndexExpression':
        this.visitIndexExpression(node);
        break;
      case 'Table':
        this.visitTable(node);
        break;
      case 'Function':
        this.visitFunction(node);
        break;
      default:
        throw new Error(`Unknown expression type: ${(node as any).type}`);
    }
  }

  private visitBinaryExpression(node: AST.BinaryExpression): void {
    this.visitExpression(node.left);
    
    if (this.options.insertSpaceAroundOperators) {
      this.write(` ${node.operator} `);
    } else {
      this.write(node.operator);
    }
    
    this.visitExpression(node.right);
  }

  private visitUnaryExpression(node: AST.UnaryExpression): void {
    this.write(node.operator);
    
    if (node.operator === 'not' && this.options.insertSpaceAfterKeywords) {
      this.write(' ');
    }
    
    this.visitExpression(node.argument);
  }

  private visitCallExpression(node: AST.CallExpression): void {
    this.visitExpression(node.callee);
    this.write('(');
    
    for (let i = 0; i < node.arguments.length; i++) {
      this.visitExpression(node.arguments[i]);
      if (i < node.arguments.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
    
    this.write(')');
  }

  private visitMemberExpression(node: AST.MemberExpression): void {
    this.visitExpression(node.object);
    this.write('.');
    this.visitExpression(node.property);
  }

  private visitIndexExpression(node: AST.IndexExpression): void {
    this.visitExpression(node.object);
    this.write('[');
    this.visitExpression(node.index);
    this.write(']');
  }

  private visitTable(node: AST.LuaTable): void {
    this.write('{');
    
    if (node.fields.length > 0) {
      this.write(' ');
      
      for (let i = 0; i < node.fields.length; i++) {
        const field = node.fields[i];
        
        if (field.key) {
          if (field.key.type === 'Identifier') {
            this.visitExpression(field.key);
          } else {
            this.write('[');
            this.visitExpression(field.key);
            this.write(']');
          }
          this.write(' = ');
        }
        
        this.visitExpression(field.value);
        
        if (i < node.fields.length - 1) {
          this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
        }
      }
      
      this.write(' ');
    }
    
    this.write('}');
  }

  private visitFunction(node: AST.LuaFunction): void {
    this.write('function(');
    
    for (let i = 0; i < node.parameters.length; i++) {
      this.visitExpression(node.parameters[i]);
      if (i < node.parameters.length - 1) {
        this.write(this.options.insertSpaceAfterComma ? ', ' : ',');
      }
    }
    
    this.writeLine(')');
    
    this.indentLevel++;
    for (const stmt of node.body) {
      this.visitStatement(stmt);
      this.write('\n');
    }
    this.indentLevel--;
    
    this.writeIndented('end');
  }
}
