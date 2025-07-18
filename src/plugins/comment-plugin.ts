import * as AST from '../types.js';
import { Plugin } from './plugin-system.js';

/**
 * Plugin for converting Lua comments to JSDoc format
 */
const CommentPlugin: Plugin = {
  name: 'CommentPlugin',
  version: '1.0.0', // Now valid since we added version to Plugin interface
  description: 'Enhances comment handling for the TypeScript generator',
  
  transformInterface: (name, properties, _options) => {
    // Changed 'options' to '_options' to mark as unused
    // Example implementation: add a comment to each property if missing
    for (const prop of properties) {
      if (!prop.description) {
        prop.description = `/** Property ${prop.name} */`;
      }
    }
    
    return { name, properties };
  },
  
  transformType: (_luauType, tsType, _options) => {
    // Changed 'luauType' and 'options' to '_luauType' and '_options' to mark as unused
    // Example implementation: doesn't modify the type, but could add comments
    return tsType;
  },
  
  process: (ast: AST.Program, _options: any) => {
    // We don't modify the AST structure, but we could enhance it with comment data
    return ast;
  },
  
  postProcess: (generatedCode: string, options: any) => {
    if (!options.config?.preserveComments) {
      return generatedCode;
    }
    
    const commentStyle = options.config?.commentStyle || 'jsdoc';
    
    // Extract Lua comments from original source (if we had access to it)
    // For now we'll add a placeholder for future implementation
    
    if (commentStyle === 'jsdoc' || commentStyle === 'both') {
      // Convert --[[ ... ]] comments to JSDoc format
      // This would involve parsing the original source, associating comments with types
      // For now, just add a note to the generated code
      return `/**
 * Generated TypeScript interfaces from Luau types
 * Note: Comment preservation is enabled but requires source association
 */
${generatedCode}`;
    }
    
    return generatedCode;
  }
};
export default CommentPlugin;
