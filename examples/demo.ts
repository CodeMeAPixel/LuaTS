import { parseLuau, generateTypes, formatLuau, analyze } from '../src/index';

// Example Luau code with type definitions
const luauCode = `
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

local function createPlayer(name: string, id: number): Player
  return {
    name = name,
    id = id,
    position = { x = 0, y = 0, z = 0 },
    health = 100
  }
end

local function movePlayer(player: Player, direction: Vector3): Player
  local newPosition = {
    x = player.position.x + direction.x,
    y = player.position.y + direction.y,
    z = player.position.z + direction.z
  }
  
  return {
    name = player.name,
    id = player.id,
    position = newPosition,
    health = player.health,
    inventory = player.inventory
  }
end
`;

console.log('=== Parsing Luau Code ===');
try {
  const ast = parseLuau(luauCode);
  console.log('✅ Successfully parsed AST');
  console.log(`Found ${ast.body.length} top-level statements`);
} catch (error) {
  console.error('❌ Parse error:', error);
}

console.log('\n=== Generating TypeScript Types ===');
try {
  const types = generateTypes(luauCode);
  console.log('✅ Generated TypeScript interfaces:');
  console.log(types);
} catch (error) {
  console.error('❌ Type generation error:', error);
}

console.log('\n=== Formatting Code ===');
try {
  const formatted = formatLuau(luauCode);
  console.log('✅ Formatted code:');
  console.log(formatted);
} catch (error) {
  console.error('❌ Formatting error:', error);
}

console.log('\n=== Complete Analysis ===');
try {
  const analysis = analyze(luauCode, true);
  console.log('✅ Analysis complete:');
  console.log(`- Errors: ${analysis.errors.length}`);
  console.log(`- AST nodes: ${analysis.ast.body.length}`);
  console.log(`- Has types: ${analysis.types ? 'Yes' : 'No'}`);
  
  if (analysis.errors.length > 0) {
    console.log('Errors found:');
    analysis.errors.forEach(err => console.log(`  - ${err.message}`));
  }
} catch (error) {
  console.error('❌ Analysis error:', error);
}
