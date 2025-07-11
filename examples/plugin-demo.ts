import { parseLuau, generateTypes, generateTypesWithPlugins } from '../src/index';
import ReadonlyPlugin from './readonly-plugin';
import { loadPlugins, applyPlugins } from '../src/plugins/plugin-system';
import { TypeGenerator } from '../src/generators';

// Example Luau code with type definitions
const luauCode = `
-- Player representation in the game world
type Vector3 = {
  x: number, -- X coordinate
  y: number, -- Y coordinate
  z: number  -- Z coordinate
}

-- Player information and status
type Player = {
  name: string,             -- Player's display name
  id: number,               -- Unique identifier
  position: Vector3,        -- Current position
  health: number,           -- Current health points
  inventory?: { [string]: number } -- Optional inventory items
}

-- Game event data structure
type GameEvent = {
  type: "PlayerJoined" | "PlayerLeft" | "PlayerMoved", -- Event type
  playerId: number,  -- ID of the player involved
  timestamp: number, -- When the event occurred
  data?: any         -- Additional event data
}
`;

async function runDemo() {
  console.log('=== Parsing Luau Code ===');
  try {
    const ast = parseLuau(luauCode);
    console.log('✅ Successfully parsed AST');
    console.log(`Found ${ast.body.length} top-level statements`);
  } catch (error) {
    console.error('❌ Parse error:', error);
  }

  console.log('\n=== Basic TypeScript Generation ===');
  try {
    const types = generateTypes(luauCode);
    console.log('✅ Generated TypeScript interfaces:');
    console.log(types);
  } catch (error) {
    console.error('❌ Type generation error:', error);
  }

  console.log('\n=== TypeScript Generation with Plugin ===');
  try {
    // Method 1: Using generateTypesWithPlugins
    const typesWithPlugin = await generateTypesWithPlugins(
      luauCode,
      { useUnknown: true },
      ['./examples/readonly-plugin.js']
    );
    
    // Method 2: Manual plugin application (for demonstration)
    const ast = parseLuau(luauCode);
    const generator = new TypeGenerator({ generateComments: true });
    
    // Apply the plugin directly
    applyPlugins(generator, [ReadonlyPlugin], {
      typeGeneratorOptions: { generateComments: true },
      config: { preserveComments: true, commentStyle: 'jsdoc' }
    });
    
    const typesWithManualPlugin = generator.generateTypeScript(ast);
    
    console.log('✅ Generated TypeScript interfaces with readonly plugin:');
    console.log(typesWithManualPlugin);
  } catch (error) {
    console.error('❌ Plugin-based type generation error:', error);
  }
}

runDemo().catch(console.error);
