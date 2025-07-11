import { parseLuau, formatLua } from '../../src/index.js';

// Test simple Lua first
console.log('=== Testing Simple Lua ===');
try {
  const simpleLua = `
    local function greet(name)
      return "Hello, " .. name
    end
  `;
  
  const formatted = formatLua(simpleLua);
  console.log('✅ Simple Lua works');
  console.log(formatted);
} catch (error) {
  console.error('❌ Simple Lua failed:', error.message);
}

// Test simple Luau type
console.log('\n=== Testing Simple Luau Type ===');
try {
  const simpleLuauType = `
    type Person = {
      name: string
    }
  `;
  
  const ast = parseLuau(simpleLuauType);
  console.log('✅ Simple Luau type works');
  console.log('AST:', JSON.stringify(ast, null, 2));
} catch (error) {
  console.error('❌ Simple Luau type failed:', error.message);
}

// Test complex type
console.log('\n=== Testing Complex Luau Type ===');
try {
  const complexType = `
    type Vector3 = {
      x: number,
      y: number,
      z: number
    }
  `;
  
  const ast = parseLuau(complexType);
  console.log('✅ Complex Luau type works');
  console.log('Found', ast.body.length, 'statements');
} catch (error) {
  console.error('❌ Complex Luau type failed:', error.message);
}
