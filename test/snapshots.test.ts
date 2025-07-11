import { test, expect, describe } from 'bun:test';
import { generateTypes } from '../dist/index.js';
import fs from 'fs';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const SNAPSHOTS_DIR = path.join(__dirname, 'snapshots');

// Ensure directories exist
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

// Helper for snapshot testing
function testFixture(fixtureName: string) {
  const fixturePath = path.join(FIXTURES_DIR, `${fixtureName}.lua`);
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${fixtureName}.ts.snap`);
  
  // Skip if fixture doesn't exist
  if (!fs.existsSync(fixturePath)) {
    console.warn(`Skipping fixture ${fixtureName} - file not found`);
    return;
  }
  
  const luaCode = fs.readFileSync(fixturePath, 'utf-8');
  const generatedTypes = generateTypes(luaCode);
  
  // Create snapshot if it doesn't exist
  if (!fs.existsSync(snapshotPath)) {
    fs.writeFileSync(snapshotPath, generatedTypes);
    console.log(`Created new snapshot for ${fixtureName}`);
    return;
  }
  
  // Compare with existing snapshot
  const snapshot = fs.readFileSync(snapshotPath, 'utf-8');
  expect(generatedTypes).toBe(snapshot);
}

// Create some example fixtures
function createExampleFixtures() {
  // Only create if they don't exist
  if (fs.readdirSync(FIXTURES_DIR).length === 0) {
    // Basic types fixture
    const basicTypes = `
      type Vector2 = {
        x: number,
        y: number
      }
      
      type Vector3 = {
        x: number,
        y: number,
        z: number
      }
      
      type Point = Vector2
    `;
    fs.writeFileSync(path.join(FIXTURES_DIR, 'basic-types.lua'), basicTypes);
    
    // Complex fixture with various type features
    const complexTypes = `
      --[[
        Game types
        This module defines the core types used in the game
      ]]
      
      type EntityId = string
      
      -- Basic entity type
      type Entity = {
        id: EntityId,
        name: string,
        active: boolean
      }
      
      -- Component types
      type Transform = {
        position: Vector3,
        rotation: Vector3,
        scale: Vector3
      }
      
      type Physics = {
        mass: number,
        velocity: Vector3,
        acceleration: Vector3,
        applyForce: (self: Physics, force: Vector3) -> ()
      }
      
      -- Specialized entity types
      type Player = Entity & {
        health: number,
        inventory: {Item},
        equipped?: Item
      }
      
      type Item = {
        id: string,
        name: string,
        value: number,
        weight: number,
        [string]: any -- Additional properties
      }
      
      type GameEvent = 
        { type: "PlayerSpawn", player: Player } |
        { type: "PlayerDeath", player: Player, cause: string } |
        { type: "ItemPickup", player: Player, item: Item }
    `;
    fs.writeFileSync(path.join(FIXTURES_DIR, 'game-types.lua'), complexTypes);
  }
}

// Create fixtures
createExampleFixtures();

describe('Snapshot Tests', () => {
  // Test basic types
  test('Basic types snapshot', () => {
    testFixture('basic-types');
  });
  
  // Test complex game types
  test('Game types snapshot', () => {
    testFixture('game-types');
  });
  
  // You can add more fixtures and tests here
});
