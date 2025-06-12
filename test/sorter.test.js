const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { sortBySchema } = require('../src/sorter');

describe('Sorter', () => {
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/schemas/json-schema.json'), 'utf8'));
  const userObject = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/objects/user.json'), 'utf8'));

  describe('sortBySchema', () => {
    it('should sort object keys according to schema property order', () => {
      const result = sortBySchema({ object: userObject, schema });
      
      const keys = Object.keys(result);
      const expectedOrder = ['name', 'age', 'email', 'address', 'phone'];
      expect(keys).to.deep.equal(expectedOrder);
    });

    it('should recursively sort nested objects', () => {
      const result = sortBySchema({ object: userObject, schema });
      
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
      const circularObj = { a: 1 };
      circularObj.self = circularObj;
      
      expect(() => sortBySchema({ object: circularObj, schema }))
        .to.throw('Circular reference detected in object');
    });

    it('should handle schema pointers', () => {
      const fullSchema = {
        definitions: {
          User: schema
        }
      };
      
      const result = sortBySchema({ 
        object: userObject, 
        schema: fullSchema, 
        options: { schemaPointer: '#/definitions/User' }
      });
      
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
      });
      
      // Top level should be sorted
      expect(Object.keys(result)).to.deep.equal(['name', 'email', 'address']);
      
      // But nested address should remain unsorted due to maxDepth
      expect(Object.keys(result.address)).to.deep.equal(['country', 'street', 'city']);
    });

    it('should handle arrays', () => {
      const arraySchema = {
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
      
      const result = sortBySchema({ object: arrayObject, schema: arraySchema });
      
      expect(result.users[0]).to.deep.equal({ name: 'Alice', age: 25 });
      expect(result.users[1]).to.deep.equal({ name: 'Bob', age: 30 });
    });

    it('should handle $ref references', () => {
      const refSchema = {
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
          age: 30,
          name: 'John'
        }
      };
      
      const result = sortBySchema({ object: refObject, schema: refSchema });
      expect(Object.keys(result.user)).to.deep.equal(['name', 'age']);
    });

    it('should handle allOf composition', () => {
      const allOfSchema = {
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
        age: 30,
        name: 'John'
      };
      
      const result = sortBySchema({ object: allOfObject, schema: allOfSchema });
      expect(Object.keys(result)).to.deep.equal(['name', 'age']);
    });

    it('should handle anyOf composition', () => {
      const anyOfSchema = {
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
        age: 30,
        name: 'John'
      };
      
      const result = sortBySchema({ object: anyOfObject, schema: anyOfSchema });
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
      const emptySchema = { type: 'object' };
      const result = sortBySchema({ object: userObject, schema: emptySchema });
      
      // Should return object with keys in alphabetical order
      const keys = Object.keys(result);
      const expectedOrder = ['address', 'age', 'email', 'name', 'phone'];
      expect(keys).to.deep.equal(expectedOrder);
    });
  });
});