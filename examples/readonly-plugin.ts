import { Plugin } from '../src/plugins/plugin-system';

/**
 * A custom plugin that adds readonly modifiers to all properties
 */
const ReadonlyPlugin: Plugin = {
  name: 'ReadonlyPlugin',
  description: 'Adds readonly modifiers to all interface properties',
  
  transformInterface: (name, properties, options) => {
    // Add readonly modifier to all properties
    const readonlyProperties = properties.map(prop => ({
      ...prop,
      readonly: true
    }));
    
    return {
      name,
      properties: readonlyProperties
    };
  },
  
  postProcess: (code, options) => {
    // Add a comment explaining what this plugin does
    return `// This code was processed with the ReadonlyPlugin, which makes all properties readonly.\n${code}`;
  }
};

export default ReadonlyPlugin;
