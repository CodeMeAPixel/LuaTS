import { parseLuau } from '../dist/index.js';

console.log('=== Testing Multiple Types ===');
try {
  const multipleTypesCode = `
    type Vector3 = {
      x: number
    }
    
    type Player = {
      name: string,
      position: Vector3
    }
  `;
  
  const ast = parseLuau(multipleTypesCode);
  console.log('✅ Multiple types work');
  console.log('Found', ast.body.length, 'statements');
} catch (error) {
  console.error('❌ Multiple types failed:', error.message);
}

console.log('\n=== Testing Any Type ===');
try {
  const anyTypeCode = `
    type Event = {
      data?: any
    }
  `;
  
  const ast = parseLuau(anyTypeCode);
  console.log('✅ Any type works');
} catch (error) {
  console.error('❌ Any type failed:', error.message);
}
