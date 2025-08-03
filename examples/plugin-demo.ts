import { parseLuau, generateTypes, generateTypesWithPlugins } from '../src/index';
import ReadonlyPlugin from './readonly-plugin';
import { applyPlugins, createPluginAwareGenerator } from '../src/plugins/plugin-system';

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

  console.log('\n=== TypeScript Generation with Object Plugin ===');
  try {
    // Method 1: Using generateTypesWithPlugins with object plugin
    const typesWithPlugin = await generateTypesWithPlugins(
      luauCode,
      { useUnknown: true },
      [ReadonlyPlugin] // Pass the plugin object directly
    );
    
    console.log('✅ Generated TypeScript with ReadonlyPlugin:');
    console.log(typesWithPlugin);
  } catch (error) {
    console.error('❌ Plugin-based type generation error:', error);
  }

  console.log('\n=== TypeScript Generation with File Plugin ===');
  try {
    // Method 2: Using generateTypesWithPlugins with file path
    const typesWithFilePlugin = await generateTypesWithPlugins(
      luauCode,
      { useUnknown: true },
      ['./examples/plugins/custom-number-plugin.js'] // Load from file
    );
    
    console.log('✅ Generated TypeScript with file-based plugin:');
    console.log(typesWithFilePlugin);
  } catch (error) {
    console.error('❌ File plugin generation error:', error);
  }

  console.log('\n=== Manual Plugin Application ===');
  try {
    // Method 3: Manual plugin application using createPluginAwareGenerator
    const generator = createPluginAwareGenerator({ 
      useUnknown: true,
      includeSemicolons: true 
    });
    
    // Apply the plugin manually
    generator.addPlugin(ReadonlyPlugin);
    
    const typesWithManualPlugin = generator.generateTypeScript(luauCode);
    
    console.log('✅ Generated TypeScript with manually applied plugin:');
    console.log(typesWithManualPlugin);
  } catch (error) {
    console.error('❌ Manual plugin application error:', error);
  }
}

// Run the demo
runDemo().catch(console.error);
