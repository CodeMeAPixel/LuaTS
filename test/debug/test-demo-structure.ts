import { parseLuau } from '../dist/index.js';

// Test the exact structure from demo.ts
const demoCode = `
type Vector3 = {
  x: number,
  y: number,
  z: number
}

type Player = {
  name: string,
  id: number,
  position: Vector3,
  health: number,
  inventory?: { [string]: number }
}

type GameEvent = {
  type: "PlayerJoined" | "PlayerLeft" | "PlayerMoved",
  playerId: number,
  timestamp: number,
  data?: any
}
`;

console.log('=== Testing Demo Code Structure ===');
try {
  const ast = parseLuau(demoCode);
  console.log('✅ Demo structure works');
  console.log('Found', ast.body.length, 'type definitions');
  
  // Log the types found
  ast.body.forEach((stmt, i) => {
    if (stmt.type === 'TypeAlias') {
      console.log(`  ${i + 1}. ${stmt.name.name}`);
    }
  });
} catch (error) {
  console.error('❌ Demo structure failed:', error.message);
  console.error('Error details:', error);
}
