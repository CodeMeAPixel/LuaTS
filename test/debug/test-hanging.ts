import { parseLuau } from '../dist/index.js';

console.log('=== Testing Type Property Issue ===');
try {
  const problematicCode = `
    type GameEvent = {
      type: string
    }
  `;
  
  console.log('Starting parse...');
  const ast = parseLuau(problematicCode);
  console.log('✅ Parse completed');
  console.log('Found', ast.body.length, 'statements');
} catch (error) {
  console.error('❌ Parse failed:', error.message);
  console.error(error.stack);
}
