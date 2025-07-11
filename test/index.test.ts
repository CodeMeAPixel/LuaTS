import { test, expect, describe } from 'bun:test';
import { parseLua, parseLuau, formatLua, generateTypes, analyze } from '../dist/index.js';

describe('Core Functionality', () => {
  test('Parse simple Lua code', () => {
    const code = `
      local function greet(name)
        return "Hello, " .. name
      end
      
      local message = greet("World")
      print(message)
    `;
    
    const ast = parseLua(code);
    expect(ast.type).toBe('Program');
    expect(ast.body).toHaveLength(3);
  });

  test('Parse Luau with type annotations', () => {
    const code = `
      type Person = {
        name: string,
        age: number
      }
      
      local function createPerson(name: string, age: number): Person
        return { name = name, age = age }
      end
    `;
    
    const ast = parseLuau(code);
    expect(ast.type).toBe('Program');
    expect(ast.body).toHaveLength(2);
  });

  test('Format Lua code', () => {
    const code = `local x=1+2 local y=x*3`;
    const formatted = formatLua(code);
    
    expect(formatted).toContain('local x = 1 + 2');
    expect(formatted).toContain('local y = x * 3');
  });

  test('Generate TypeScript types from Luau', () => {
    const code = `
      type User = {
        id: number,
        name: string,
        email?: string
      }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('interface User');
    expect(types).toContain('id: number');
    expect(types).toContain('email?: string');
  });

  test('Analyze code with errors', () => {
    const code = `local function broken( -- missing closing paren`;
    const result = analyze(code);
    
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.ast.type).toBe('Program');
  });
});

describe('Complex Type Handling', () => {
  test('Complex Luau parsing', () => {
    const code = `
      type Vector3 = {
        x: number,
        y: number,
        z: number
      }
      
      type Player = {
        name: string,
        position: Vector3,
        health: number
      }
      
      local function movePlayer(player: Player, direction: Vector3): Player
        return {
          name = player.name,
          position = {
            x = player.position.x + direction.x,
            y = player.position.y + direction.y,
            z = player.position.z + direction.z
          },
          health = player.health
        }
      end
    `;
    
    const result = analyze(code, true);
    expect(result.errors).toHaveLength(0);
    expect(result.types).toContain('interface Vector3');
    expect(result.types).toContain('interface Player');
  });
});
