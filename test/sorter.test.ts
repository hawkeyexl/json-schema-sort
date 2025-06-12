import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { sortBySchema } from '../src/sorter';
import { JsonSchema } from '../src/types';

describe('Sorter', () => {
  const schema: JsonSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/schemas/json-schema.json'), 'utf8'));
  const userObject = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/objects/user.json'), 'utf8'));

  describe('sortBySchema', () => {
    it('should sort object keys according to schema property order', () => {
      const result = sortBySchema({ object: userObject, schema }) as Record<string, any>;
      
      const keys = Object.keys(result);
      const expectedOrder = ['name', 'age', 'email', 'address', 'phone'];
      expect(keys).to.deep.equal(expectedOrder);
    });

    it('should recursively sort nested objects', () => {
      const result = sortBySchema({ object: userObject, schema }) as Record<string, any>;
      
      const addressKeys = Object.keys(result.address);
      const expectedAddressOrder = ['street', 'city', 'country'];
      expect(addressKeys).to.deep.equal(expectedAddressOrder);
    });

    it('should handle empty objects', () => {
      const result = sortBySchema({ object: {}, schema });
      expect(result).to.deep.equal({});
    });

    it('should handle non-object inputs', () => {
      expect(sortBySchema({ object: null, schema })).to.be.null;
      expect(sortBySchema({ object: 'string', schema })).to.equal('string');
      expect(sortBySchema({ object: [], schema })).to.deep.equal([]);
    });

    it('should handle circular references', () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;
      
      expect(() => sortBySchema({ object: circularObj, schema }))
        .to.throw('Circular reference detected in object');
    });

    it('should handle schema pointers', () => {
      const fullSchema: JsonSchema = {
        definitions: {
          User: schema
        }
      };
      
      const result = sortBySchema({ 
        object: userObject, 
        schema: fullSchema, 
        options: { schemaPointer: '#/definitions/User' }
      }) as Record<string, any>;
      
      const keys = Object.keys(result);
      const expectedOrder = ['name', 'age', 'email', 'address', 'phone'];
      expect(keys).to.deep.equal(expectedOrder);
    });

    it('should respect maxDepth option', () => {
      const deepObject = {
        email: 'test@example.com',
        name: 'Test',
        address: {
          country: 'USA',
          street: '123 St',
          city: 'NYC'
        }
      };
      
      const result = sortBySchema({ 
        object: deepObject, 
        schema, 
        options: { maxDepth: 1 } 
      }) as Record<string, any>;
      
      // Top level should be sorted
      expect(Object.keys(result)).to.deep.equal(['name', 'email', 'address']);
      
      // But nested address should remain unsorted due to maxDepth
      expect(Object.keys(result.address)).to.deep.equal(['country', 'street', 'city']);
    });

    it('should handle arrays', () => {
      const arraySchema: JsonSchema = {
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
      
      const arrayObject = {
        users: [
          { age: 25, name: 'Alice' },
          { age: 30, name: 'Bob' }
        ]
      };
      
      const result = sortBySchema({ object: arrayObject, schema: arraySchema }) as Record<string, any>;
      
      expect(result.users[0]).to.deep.equal({ name: 'Alice', age: 25 });
      expect(result.users[1]).to.deep.equal({ name: 'Bob', age: 30 });
    });

    it('should handle $ref references', () => {
      const refSchema: JsonSchema = {
        type: 'object',
        properties: {
          user: {
            $ref: '#/definitions/User'
          }
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
      
      const refObject = {
        user: {
          age: 25,
          name: 'Alice'
        }
      };
      
      const result = sortBySchema({ object: refObject, schema: refSchema }) as Record<string, any>;
      expect(Object.keys(result.user)).to.deep.equal(['name', 'age']);
    });

    it('should handle allOf composition', () => {
      const allOfSchema: JsonSchema = {
        type: 'object',
        allOf: [
          {
            properties: {
              name: { type: 'string' }
            }
          },
          {
            properties: {
              age: { type: 'number' }
            }
          }
        ]
      };
      
      const allOfObject = {
        age: 25,
        name: 'Alice'
      };
      
      const result = sortBySchema({ object: allOfObject, schema: allOfSchema }) as Record<string, any>;
      expect(Object.keys(result)).to.deep.equal(['name', 'age']);
    });

    it('should handle anyOf composition', () => {
      const anyOfSchema: JsonSchema = {
        type: 'object',
        anyOf: [
          {
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          },
          {
            properties: {
              title: { type: 'string' }
            }
          }
        ]
      };
      
      const anyOfObject = {
        age: 25,
        name: 'Alice'
      };
      
      const result = sortBySchema({ object: anyOfObject, schema: anyOfSchema }) as Record<string, any>;
      expect(Object.keys(result)).to.deep.equal(['name', 'age']);
    });

    it('should throw error for invalid schema pointer', () => {
      expect(() => sortBySchema({ 
        object: userObject, 
        schema, 
        options: { schemaPointer: '#/invalid/pointer' } 
      })).to.throw('Schema not found at pointer: #/invalid/pointer');
    });

    it('should handle schemas without properties', () => {
      const emptySchema: JsonSchema = {
        type: 'object'
      };
      
      const result = sortBySchema({ object: userObject, schema: emptySchema }) as Record<string, any>;
      
      // Should return object with keys in alphabetical order
      const keys = Object.keys(result);
      const expectedOrder = ['address', 'age', 'email', 'name', 'phone'];
      expect(keys).to.deep.equal(expectedOrder);
    });
  });
});