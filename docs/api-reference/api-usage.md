---
layout: default
title: API Usage
parent: API Reference
nav_order: 1
---

# API Usage Guide

This guide provides comprehensive examples and best practices for using the LuaTS API.

## Basic Usage

### Type Conversion

```typescript
import { generateTypes } from 'luats';

// Basic type conversion
const tsCode = generateTypes(`
type Vector3 = {
  x: number,
  y: number,
  z: number
}
`);

console.log(tsCode);
// Output:
// interface Vector3 {
//   x: number;
//   y: number;
//   z: number;
// }
```

### Options

```typescript
import { generateTypes, GenerateOptions } from 'luats';

const options: GenerateOptions = {
  // Enable type inference for inline tables
  inferInlineTables: true,
  // Preserve original comments
  preserveComments: true,
  // Use JSDoc-style comments
  useJSDoc: true,
  // Convert table types to arrays when possible
  preferArrayTypes: true,
  // Handle type intersections
  handleIntersections: true
};

const tsCode = generateTypes(`
type User = {
  id: string,
  name: string,
  --! @deprecated
  legacyField: string?
}
`, options);
```

## Advanced Usage

### Type Merging

```typescript
import { generateTypes } from 'luats';

const tsCode = generateTypes(`
type Base = {
  id: string
}

type User = Base & {
  name: string
}
`);

// Output:
// interface Base {
//   id: string;
// }
// 
// interface User extends Base {
//   name: string;
// }
```

### Type Inference

```typescript
const tsCode = generateTypes(`
local user = {
  id = "123",
  name = "John",
  age = 30
}
`);

// Output:
// interface User {
//   id: string;
//   name: string;
//   age: number;
// }
```

### Function Types

```typescript
const tsCode = generateTypes(`
type Callback = (value: number) => string

type User = {
  getName: () => string
}
`);

// Output:
// type Callback = (value: number) => string;
// 
// interface User {
//   getName(): string;
// }
```

## Error Handling

```typescript
import { generateTypes } from 'luats';

try {
  const tsCode = generateTypes(`
  type Invalid = {
    -- Invalid syntax
  }
  `);
} catch (error) {
  console.error(error.message);
  // Output: "Syntax error in type definition"
}
```

## Performance Considerations

```typescript
import { generateTypes } from 'luats';

// Process multiple files efficiently
const files = [
  'types/user.luau',
  'types/game.luau',
  'types/ui.luau'
];

// Process in batches
const batchSize = 100;
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize);
  // Process batch...
}
```

## Best Practices

1. **Use Type Aliases for Complex Types**
   ```typescript
   type ComplexType = {
     [key: string]: {
       value: any,
       metadata: {
         created: number,
         modified: number
       }
     }
   }
   ```

2. **Document Types with JSDoc**
   ```typescript
   /**
    * Represents a user in the system
    * @property {string} id - Unique user identifier
    * @property {string} name - User's display name
    */
   type User = {
     id: string,
     name: string
   }
   ```

3. **Use Interfaces for Object Types**
   ```typescript
   interface User {
     id: string;
     name: string;
   }
   ```

4. **Prefer Union Types Over Any**
   ```typescript
   // Instead of:
   type Value = any;
   
   // Use:
   type Value = string | number | boolean;
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
   type User = {
     name: string,
     age?: number
   }
   ```

3. **Use Type Guards**
   ```typescript
   type User = {
     type: 'user',
     name: string
   }
   
   type Admin = {
     type: 'admin',
     permissions: string[]
   }
   
   type Account = User | Admin;
   ```
