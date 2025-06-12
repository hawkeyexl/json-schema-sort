# object-schema-sorter

Sort object keys based on JSON Schema property order with full TypeScript support.

## Installation
```bash
npm install object-schema-sorter
```

## Usage

### JavaScript (CommonJS)
```javascript
const { sortBySchema } = require('object-schema-sorter');

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    email: { type: 'string' }
  }
};

const object = {
  email: 'john@example.com',
  name: 'John Doe',
  age: 30
};

const sorted = sortBySchema({ object, schema });
console.log(Object.keys(sorted)); // ['name', 'age', 'email']
```

### TypeScript (ES Modules)
```typescript
import { sortBySchema, JsonSchema } from 'object-schema-sorter';

const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    email: { type: 'string' }
  }
};

const object = {
  email: 'john@example.com',
  name: 'John Doe',
  age: 30
};

const sorted = sortBySchema({ object, schema });
console.log(Object.keys(sorted)); // ['name', 'age', 'email']
```

## Features
- **TypeScript First**: Built with TypeScript with comprehensive type definitions
- Sorts object keys according to JSON Schema property order
- Supports JSON Schema, OpenAPI, AsyncAPI, and any object with valid JSON schemas
- Handles nested objects and arrays recursively
- Places additional properties alphabetically at the end
- Resolves $ref and JSON Pointer references
- Handles anyOf/oneOf/allOf compositions
- Prevents infinite recursion with configurable depth limits
- Detects and prevents circular references

## API

### sortBySchema(params)

Sorts an object according to the property order defined in a JSON Schema.

**Parameters:**
- `object` (required): The object to sort
- `schema` (required): The schema document
- `options` (optional): Configuration options
  - `maxDepth` (number): Maximum recursion depth (default: 10)
  - `schemaPointer` (string): JSON Pointer to sub-schema within the schema document

**Returns:** A new object with sorted keys.

**Example with schema pointer:**
```javascript
const openApiSchema = {
  openapi: '3.0.0',
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      }
    }
  }
};

const user = {
  email: 'user@example.com',
  name: 'John Doe',
  id: 1
};

const sorted = sortBySchema({
  object: user,
  schema: openApiSchema,
  options: { schemaPointer: '#/components/schemas/User' }
});
```

**Example with nested objects:**
```javascript
const schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' }
          }
        }
      }
    }
  }
};

const object = {
  user: {
    address: {
      city: 'New York',
      street: '123 Main St'
    },
    name: 'John Doe'
  }
};

const sorted = sortBySchema({ object, schema });
// Recursively sorts all nested objects according to their schemas
```

**Example with arrays:**
```javascript
const schema = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    }
  }
};

const object = {
  users: [
    { age: 25, name: 'Alice' },
    { age: 30, name: 'Bob' }
  ]
};

const sorted = sortBySchema({ object, schema });
// Each object in the array will be sorted according to the items schema
```

## Advanced Features

### Schema Compositions

The library supports JSON Schema composition keywords:

```javascript
// allOf - merges properties from multiple schemas
const allOfSchema = {
  allOf: [
    { properties: { name: { type: 'string' } } },
    { properties: { age: { type: 'number' } } }
  ]
};

// anyOf/oneOf - finds the best matching schema
const anyOfSchema = {
  anyOf: [
    { properties: { name: { type: 'string' }, age: { type: 'number' } } },
    { properties: { title: { type: 'string' } } }
  ]
};
```

### $ref Resolution

The library resolves $ref references within the schema document:

```javascript
const schema = {
  type: 'object',
  properties: {
    user: { $ref: '#/definitions/User' }
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    }
  }
};
```

### Additional Properties

Properties not defined in the schema are placed at the end in alphabetical order:

```javascript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' }
  }
};

const object = {
  zzz: 'last',
  name: 'John',
  aaa: 'first'
};

const sorted = sortBySchema({ object, schema });
// Result: { name: 'John', aaa: 'first', zzz: 'last' }
```

## Error Handling

The library throws errors for:
- Circular references in objects
- Invalid schema pointers
- Objects that exceed maximum depth

```javascript
try {
  const sorted = sortBySchema({ object, schema });
} catch (error) {
  console.error('Sorting failed:', error.message);
}
```

## TypeScript Support

While this library is written in JavaScript, it works well with TypeScript projects. Type definitions may be added in future versions.

## Performance

The library is designed for correctness over performance. For very large objects or schemas, consider:
- Using a smaller `maxDepth` value
- Pre-processing schemas to remove unnecessary complexity
- Caching sorted results when possible

## License

MIT