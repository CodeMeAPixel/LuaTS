import { Plugin } from '../src/plugins/plugin-system';

/**
 * A custom plugin that adds readonly modifiers to all properties
 */
const ReadonlyPlugin: Plugin = {
  name: 'ReadonlyPlugin',
  description: 'Adds readonly modifiers to all interface properties',
  version: '1.0.0',
  
  transformInterface: (name, properties, options) => {
    // Add readonly modifier to all properties by transforming their TypeScript representation
    const readonlyProperties = properties.map(prop => ({
      ...prop,
      // Since we can't directly modify the readonly flag, we'll transform the type name
      name: prop.name,
      type: prop.type,
      optional: prop.optional,
      // Add a custom marker that can be used in postProcess
      _readonly: true
    }));
    
    return {
      name,
      properties: readonlyProperties
    };
  },
  
  postProcess: (code, options) => {
    // Transform the generated TypeScript to add readonly modifiers
    // Replace property declarations with readonly versions
    const readonlyCode = code.replace(
      /^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)([\?]?):\s*(.+);$/gm,
      '$1readonly $2$3: $4;'
    );
    
    // Add a comment explaining what this plugin does
    return `// This code was processed with the ReadonlyPlugin, which makes all properties readonly.\n${readonlyCode}`;
  }
};

export default ReadonlyPlugin;
