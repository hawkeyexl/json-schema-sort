"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const schema_resolver_1 = require("../src/schema-resolver");
const constants_1 = require("../src/constants");
describe('Schema Resolver', () => {
    describe('resolveSchema', () => {
        const schema = {
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
            const result = (0, schema_resolver_1.resolveSchema)(schema, '#');
            (0, chai_1.expect)(result).to.equal(schema);
        });
        it('should resolve schema at JSON pointer', () => {
            const result = (0, schema_resolver_1.resolveSchema)(schema, '#/properties/user');
            (0, chai_1.expect)(result).to.deep.equal(schema.properties.user);
        });
        it('should return null for invalid pointer', () => {
            const result = (0, schema_resolver_1.resolveSchema)(schema, '#/invalid/path');
            (0, chai_1.expect)(result).to.be.null;
        });
    });
    describe('resolveRef', () => {
        const schema = {
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
            const result = (0, schema_resolver_1.resolveRef)(schema, '#/definitions/User');
            (0, chai_1.expect)(result).to.deep.equal(schema.definitions.User);
        });
        it('should return null for external $ref', () => {
            const result = (0, schema_resolver_1.resolveRef)(schema, 'external.json#/User');
            (0, chai_1.expect)(result).to.be.null;
        });
        it('should return null for invalid $ref', () => {
            const result = (0, schema_resolver_1.resolveRef)(schema, '');
            (0, chai_1.expect)(result).to.be.null;
        });
    });
    describe('detectSchemaType', () => {
        it('should detect OpenAPI schema', () => {
            const schema = { openapi: '3.0.0' };
            (0, chai_1.expect)((0, schema_resolver_1.detectSchemaType)(schema)).to.equal(constants_1.SCHEMA_TYPES.OPENAPI);
        });
        it('should detect AsyncAPI schema', () => {
            const schema = { asyncapi: '2.0.0' };
            (0, chai_1.expect)((0, schema_resolver_1.detectSchemaType)(schema)).to.equal(constants_1.SCHEMA_TYPES.ASYNCAPI);
        });
        it('should detect JSON Schema', () => {
            const schema = { $schema: 'http://json-schema.org/draft-07/schema#' };
            (0, chai_1.expect)((0, schema_resolver_1.detectSchemaType)(schema)).to.equal(constants_1.SCHEMA_TYPES.JSON_SCHEMA);
        });
        it('should detect generic schema', () => {
            const schema = { someProperty: 'value' };
            (0, chai_1.expect)((0, schema_resolver_1.detectSchemaType)(schema)).to.equal(constants_1.SCHEMA_TYPES.GENERIC);
        });
    });
    describe('findMatchingSchema', () => {
        const schemas = [
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
            const result = (0, schema_resolver_1.findMatchingSchema)(object, schemas);
            (0, chai_1.expect)(result).to.equal(schemas[0]);
        });
        it('should return null for no matches', () => {
            const result = (0, schema_resolver_1.findMatchingSchema)({}, []);
            (0, chai_1.expect)(result).to.be.null;
        });
    });
    describe('mergeSchemaProperties', () => {
        const schemas = [
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
            const result = (0, schema_resolver_1.mergeSchemaProperties)(schemas);
            (0, chai_1.expect)(result.properties).to.deep.equal({
                name: { type: 'string' },
                age: { type: 'number' },
                email: { type: 'string' }
            });
            (0, chai_1.expect)(result.propertyOrder).to.deep.equal(['name', 'age', 'email']);
        });
        it('should return empty object for invalid input', () => {
            const result = (0, schema_resolver_1.mergeSchemaProperties)(null);
            (0, chai_1.expect)(result).to.deep.equal({ properties: {}, propertyOrder: [] });
        });
    });
});
//# sourceMappingURL=schema-resolver.test.js.map