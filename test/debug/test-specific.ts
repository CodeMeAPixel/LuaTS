import { parseLuau } from '../dist/index.js';

console.log('=== Testing Optional Fields ===');
try {
  const optionalFieldCode = `
    type Player = {
      name: string,
      inventory?: { [string]: number }
    }
  `;
  
  const ast = parseLuau(optionalFieldCode);
  console.log('✅ Optional fields work');
} catch (error) {
  console.error('❌ Optional fields failed:', error.message);
}

console.log('\n=== Testing Union Types ===');
try {
  const unionTypeCode = `
    type EventType = "PlayerJoined" | "PlayerLeft"
  `;
  
  const ast = parseLuau(unionTypeCode);
  console.log('✅ Union types work');
} catch (error) {
  console.error('❌ Union types failed:', error.message);
}

console.log('\n=== Testing Index Signatures ===');
try {
  const indexSignatureCode = `
    type Inventory = { [string]: number }
  `;
  
  const ast = parseLuau(indexSignatureCode);
  console.log('✅ Index signatures work');
} catch (error) {
  console.error('❌ Index signatures failed:', error.message);
}
