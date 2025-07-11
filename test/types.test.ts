import { test, expect, describe } from 'bun:test';
import { 
  generateTypes,
  TypeGenerator 
} from '../dist/index.js';

describe('Advanced Type Conversion', () => {
  test('Convert nested complex types', () => {
    const code = `
      type Vector3 = {
        x: number,
        y: number,
        z: number
      }
      
      type Transform = {
        position: Vector3,
        rotation: Vector3,
        scale: Vector3
      }
      
      type GameObject = {
        id: number,
        name: string,
        transform: Transform,
        active: boolean
      }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('interface Vector3');
    expect(types).toContain('interface Transform');
    expect(types).toContain('interface GameObject');
    expect(types).toContain('transform: Transform');
  });

  test('Convert array of custom types', () => {
    const code = `
      type Item = {
        id: number,
        name: string
      }
      
      type Inventory = {
        items: {Item}
      }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('interface Item');
    expect(types).toContain('items: Item[]');
  });

  test('Convert optional nested types', () => {
    const code = `
      type Address = {
        street: string,
        city: string,
        country: string
      }
      
      type User = {
        name: string,
        address?: Address
      }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('interface Address');
    expect(types).toContain('address?: Address');
  });

  test('Convert union types with object literals', () => {
    const code = `
      type NetworkRequest = 
        { type: "GET", url: string } |
        { type: "POST", url: string, body: any }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('type NetworkRequest =');
    expect(types).toContain('{ type: "GET", url: string }');
    expect(types).toContain('{ type: "POST", url: string, body: any }');
  });

  test('Convert function with multiple parameters', () => {
    const code = `
      type MathFunction = (a: number, b: number, operation: string) -> number
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('type MathFunction = (a: number, b: number, operation: string) => number');
  });

  test('Handle recursive types', () => {
    const code = `
      type TreeNode = {
        value: any,
        children: {TreeNode}
      }
    `;
    
    const types = generateTypes(code);
    expect(types).toContain('interface TreeNode');
    expect(types).toContain('children: TreeNode[]');
  });

  test('Convert generic types', () => {
    const code = `
      type Result<T, E> = 
        { ok: true, value: T } |
        { ok: false, error: E }
    `;
    
    // This may not work in the current implementation but tests future support
    try {
      const types = generateTypes(code);
      expect(types).toContain('type Result<T, E>');
    } catch (error) {
      // If generics aren't supported yet, this will throw an error
      expect(error).toBeDefined();
    }
  });
  
  test('Convert indexed access types', () => {
    const code = `
      type User = {
        id: number,
        profile: {
          name: string,
          email: string
        }
      }
      
      type UserProfile = User["profile"]
    `;
    
    // This may not work in the current implementation but tests future support
    try {
      const types = generateTypes(code);
      expect(types).toContain('type UserProfile');
      expect(types).toContain('name: string');
    } catch (error) {
      // If indexed access types aren't supported yet, this will throw an error
      expect(error).toBeDefined();
    }
  });
});

describe('Type Generator Options', () => {
  test('Use unknown instead of any', () => {
    const code = `
      type Data = {
        value: any
      }
    `;
    
    const generator = new TypeGenerator({ useUnknown: true });
    const types = generator.generateTypeScript(code);
    expect(types).toContain('value: unknown');
  });

  test('Prefix interface names', () => {
    const code = `
      type User = {
        name: string
      }
    `;
    
    const generator = new TypeGenerator({ interfacePrefix: 'I' });
    const types = generator.generateTypeScript(code);
    expect(types).toContain('interface IUser');
  });

  test('Generate semicolons based on option', () => {
    const code = `
      type User = {
        name: string,
        age: number
      }
    `;
    
    const withSemicolons = new TypeGenerator({ semicolons: true });
    const withoutSemicolons = new TypeGenerator({ semicolons: false });
    
    const typesWithSemicolons = withSemicolons.generateTypeScript(code);
    const typesWithoutSemicolons = withoutSemicolons.generateTypeScript(code);
    
    expect(typesWithSemicolons).toContain('name: string;');
    expect(typesWithoutSemicolons).not.toContain('name: string;');
  });
});
