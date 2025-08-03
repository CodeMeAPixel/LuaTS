/**
 * Example plugin that transforms 'number' types to 'CustomNumber'
 */
module.exports = {
  name: 'CustomNumberPlugin',
  description: 'Transforms number types to CustomNumber for better type safety',
  version: '1.0.0',
  
  transformType: (luauType, tsType, options) => {
    if (luauType === 'NumberType' && tsType === 'number') {
      return 'CustomNumber';
    }
    return tsType;
  },
  
  transformInterface: (name, properties, options) => {
    // Transform properties to use CustomNumber
    const transformedProperties = properties.map(prop => {
      if (prop.type === 'number') {
        return { ...prop, type: 'CustomNumber' };
      }
      return prop;
    });
    
    return {
      name,
      properties: transformedProperties
    };
  },
  
  postProcess: (generatedCode, options) => {
    // Add CustomNumber type definition at the top
    const customNumberDef = 'type CustomNumber = number & { __brand: "CustomNumber" };\n\n';
    return customNumberDef + generatedCode;
  }
};
