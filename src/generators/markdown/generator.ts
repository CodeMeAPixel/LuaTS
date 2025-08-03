/**
 * MarkdownGenerator
 * 
 * Generates Markdown documentation from a parsed API/type definition object.
 * 
 * Usage:
 *   import { MarkdownGenerator } from './generators/markdown/generator';
 *   const md = new MarkdownGenerator({ title: "API" }).generate(apiObject);
 * 
 * See docs/api-reference.md for more details.
 */
export interface MarkdownGenOptions {
  title?: string;
  description?: string;
  includeTypes?: boolean;
  includeExamples?: boolean;
}

export class MarkdownGenerator {
  private options: MarkdownGenOptions;

  constructor(options: MarkdownGenOptions = {}) {
    this.options = options;
  }

  /**
   * Generate Markdown documentation from a Lua/Luau AST or API description.
   */
  public generate(api: any): string {
    let md = '';

    // Title
    if (this.options.title) {
      md += `# ${this.options.title}\n\n`;
    } else if (api.name) {
      md += `# ${api.name}\n\n`;
    }

    // Description
    if (this.options.description) {
      md += `${this.options.description}\n\n`;
    } else if (api.description) {
      md += `${api.description}\n\n`;
    }

    // Table of Contents
    md += `## Table of Contents\n\n`;
    if (api.functions && api.functions.length > 0) {
      md += `- [Functions](#functions)\n`;
    }
    if (api.types && api.types.length > 0) {
      md += `- [Types](#types)\n`;
    }
    if (api.examples && api.examples.length > 0) {
      md += `- [Examples](#examples)\n`;
    }
    md += '\n';

    // Functions
    if (api.functions && api.functions.length > 0) {
      md += `## Functions\n\n`;
      for (const fn of api.functions) {
        md += this.renderFunction(fn);
      }
    }

    // Types
    if (this.options.includeTypes !== false && api.types && api.types.length > 0) {
      md += `## Types\n\n`;
      for (const type of api.types) {
        md += this.renderType(type);
      }
    }

    // Examples
    if (this.options.includeExamples !== false && api.examples && api.examples.length > 0) {
      md += `## Examples\n\n`;
      for (const ex of api.examples) {
        md += `### ${ex.title || 'Example'}\n\n`;
        if (ex.description) md += `${ex.description}\n\n`;
        md += '```lua\n' + ex.code + '\n```\n\n';
      }
    }

    return md.trim();
  }

  private renderFunction(fn: any): string {
    let md = `### \`${fn.name}\`\n\n`;
    if (fn.description) md += `${fn.description}\n\n`;
    md += '**Signature:**\n\n';
    md += '```lua\n';
    md += fn.signature || this.formatFunctionSignature(fn);
    md += '\n```\n\n';
    if (fn.parameters && fn.parameters.length > 0) {
      md += '**Parameters:**\n\n';
      md += '| Name | Type | Description |\n|---|---|---|\n';
      for (const param of fn.parameters) {
        md += `| \`${param.name}\` | \`${param.type}\` | ${param.description || ''} |\n`;
      }
      md += '\n';
    }
    if (fn.returns) {
      md += `**Returns:** \`${fn.returns.type}\``;
      if (fn.returns.description) md += ` — ${fn.returns.description}`;
      md += '\n\n';
    }
    return md;
  }

  private renderType(type: any): string {
    let md = `### \`${type.name}\`\n\n`;
    if (type.description) md += `${type.description}\n\n`;
    md += '```lua\n';
    md += type.definition || '';
    md += '\n```\n\n';
    return md;
  }

  private formatFunctionSignature(fn: any): string {
    const params = (fn.parameters || []).map((p: any) => p.name).join(', ');
    return `function ${fn.name}(${params}) end`;
  }
}