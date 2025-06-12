import { expect } from 'chai';
import { resolveSchema, resolveRef, detectSchemaType, findMatchingSchema, mergeSchemaProperties } from '../src/schema-resolver';
import { SCHEMA_TYPES } from '../src/constants';
import { JsonSchema } from '../src/types';

describe('Schema Resolver', () => {
  describe('resolveSchema', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      }
    };

    it('should resolve root schema for empty pointer', () => {
      const result = resolveSchema(schema, '#');
      expect(result).to.equal(schema);
    });

    it('should resolve schema at JSON pointer', () => {
      const result = resolveSchema(schema, '#/properties/user');
      expect(result).to.deep.equal(schema.properties!.user);
    });

    it('should return null for invalid pointer', () => {
      const result = resolveSchema(schema, '#/invalid/path');
      expect(result).to.be.null;
    });
  });

  describe('resolveRef', () => {
    const schema: JsonSchema = {
      definitions: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          }
        }
      }
    };

    it('should resolve internal $ref', () => {
      const result = resolveRef(schema, '#/definitions/User');
      expect(result).to.deep.equal(schema.definitions!.User);
    });

    it('should return null for external $ref', () => {
      const result = resolveRef(schema, 'external.json#/User');
      expect(result).to.be.null;
    });

    it('should return null for invalid $ref', () => {
      const result = resolveRef(schema, '');
      expect(result).to.be.null;
    });
  });

  describe('detectSchemaType', () => {
    it('should detect OpenAPI schema', () => {
      const schema = { openapi: '3.0.0' };
      expect(detectSchemaType(schema)).to.equal(SCHEMA_TYPES.OPENAPI);
    });

    it('should detect AsyncAPI schema', () => {
      const schema = { asyncapi: '2.0.0' };
      expect(detectSchemaType(schema)).to.equal(SCHEMA_TYPES.ASYNCAPI);
    });

    it('should detect JSON Schema', () => {
      const schema = { $schema: 'http://json-schema.org/draft-07/schema#' };
      expect(detectSchemaType(schema)).to.equal(SCHEMA_TYPES.JSON_SCHEMA);
    });

    it('should detect generic schema', () => {
      const schema = { someProperty: 'value' };
      expect(detectSchemaType(schema)).to.equal(SCHEMA_TYPES.GENERIC);
    });
  });

  describe('findMatchingSchema', () => {
    const schemas: JsonSchema[] = [
      {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      },
      {
        properties: {
          title: { type: 'string' },
          description: { type: 'string' }
        }
      }
    ];

    it('should find best matching schema', () => {
      const object = { name: 'John', age: 30 };
      const result = findMatchingSchema(object, schemas);
      expect(result).to.equal(schemas[0]);
    });

    it('should return null for no matches', () => {
      const result = findMatchingSchema({}, []);
      expect(result).to.be.null;
    });
  });

  describe('mergeSchemaProperties', () => {
    const schemas: JsonSchema[] = [
      {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      },
      {
        properties: {
          email: { type: 'string' }
        }
      }
    ];

    it('should merge properties from multiple schemas', () => {
      const result = mergeSchemaProperties(schemas);
      expect(result.properties).to.deep.equal({
        name: { type: 'string' },
        age: { type: 'number' },
        email: { type: 'string' }
      });
      expect(result.propertyOrder).to.deep.equal(['name', 'age', 'email']);
    });

    it('should return empty object for invalid input', () => {
      const result = mergeSchemaProperties(null as any);
      expect(result).to.deep.equal({ properties: {}, propertyOrder: [] });
    });
  });
});