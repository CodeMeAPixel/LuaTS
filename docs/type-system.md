---
layout: default
title: Type System
nav_order: 3
---

# Type System

This guide explains how the LuaTS type system works and how to effectively use it for type conversion.

## Type Conversion Rules

### Basic Types

| Lua Type | TypeScript Type |
|----------|-----------------|
| `string` | `string`        |
| `number` | `number`        |
| `boolean`| `boolean`       |
| `nil`    | `undefined`     |
| `any`    | `any`           |

### Table Types

```typescript
// Lua
{
  x: number,
  y: number
}

// TypeScript
interface Table {
  x: number;
  y: number;
}
```

### Array Types

```typescript
-- Lua
{string}

// TypeScript
string[]
```

### Union Types

```typescript
-- Lua
type Value = string | number

// TypeScript
type Value = string | number
```

### Intersection Types

```typescript
-- Lua
type User = Base & {
  name: string
}

// TypeScript
interface User extends Base {
  name: string;
}
```

## Advanced Features

### Type Inference

```typescript
-- Lua
local user = {
  id = "123",
  name = "John"
}

// TypeScript
interface User {
  id: string;
  name: string;
}
```

### Optional Types

```typescript
-- Lua
type User = {
  name: string,
  age?: number
}

// TypeScript
interface User {
  name: string;
  age?: number;
}
```

### Type Guards

```typescript
-- Lua
type User = {
  type: 'user',
  name: string
}

type Admin = {
  type: 'admin',
  permissions: string[]
}

// TypeScript
type User = {
  type: 'user';
  name: string;
}

type Admin = {
  type: 'admin';
  permissions: string[];
}

type Account = User | Admin;
```

## Best Practices

1. **Be Explicit with Types**
   ```typescript
   // Instead of:
   type Value = any;
   
   // Use:
   type Value = string | number | boolean;
   ```

2. **Use Interfaces for Complex Objects**
   ```typescript
   interface User {
     id: string;
     name: string;
     age?: number;
   }
   ```

3. **Document Complex Types**
   ```typescript
   /**
    * Represents a user in the system
    * @property {string} id - Unique user identifier
    * @property {string} name - User's display name
    */
   interface User {
     id: string;
     name: string;
   }
   ```

4. **Use Type Guards for Discriminated Unions**
   ```typescript
   interface Circle {
     type: 'circle';
     radius: number;
   }
   
   interface Square {
     type: 'square';
     side: number;
   }
   
   type Shape = Circle | Square;
   ```

## Common Pitfalls

1. **Avoid Circular References**
   ```typescript
   // Bad:
   type Node = {
     children: Node[]
   }
   
   // Good:
   interface Node {
     children: Node[];
   }
   ```

2. **Be Explicit with Optional Properties**
   ```typescript
   // Bad:
   type User = {
     name: string,
     age?: number
   }
   
   // Good:
   interface User {
     name: string;
     age?: number;
   }
   ```

3. **Avoid Using `any`**
   ```typescript
   // Bad:
   type Value = any;
   
   // Good:
   type Value = string | number | boolean;
   ```

## Performance Considerations

1. **Use Type Aliases for Simple Types**
   ```typescript
   type UserId = string;
   type Username = string;
   ```

2. **Use Interfaces for Complex Objects**
   ```typescript
   interface User {
     id: UserId;
     name: Username;
     age?: number;
   }
   ```

3. **Avoid Deeply Nested Types**
   ```typescript
   // Instead of:
   type Deep = {
     level1: {
       level2: {
         level3: {
           value: string
         }
       }
     }
   }
   
   // Use:
   interface Level3 {
     value: string;
   }
   
   interface Level2 {
     level3: Level3;
   }
   
   interface Level1 {
     level2: Level2;
   }
   
   interface Deep {
     level1: Level1;
   }
   ```
