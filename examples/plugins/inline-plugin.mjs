/**
 * Example ESM plugin that inlines simple types
 */
export default {
  name: 'InlinePlugin',
  description: 'Inlines simple single-property interfaces',
  version: '1.0.0',
  
  transformInterface: (name, properties, options) => {
    // If interface has only one property, suggest inlining
    if (properties.length === 1) {
      const prop = properties[0];
      console.log(`InlinePlugin: Consider inlining ${name} with single property: ${prop.name}`);
    }
    
    return { name, properties };
  },
  
  postProcess: (generatedCode, options) => {
    // Add comment about inlining opportunities
    const inlineComment = '// Consider inlining single-property interfaces for better performance\n';
    return inlineComment + generatedCode;
  }
};
