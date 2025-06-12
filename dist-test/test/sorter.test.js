"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sorter_1 = require("../src/sorter");
describe('Sorter', () => {
    const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/schemas/json-schema.json'), 'utf8'));
    const userObject = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/objects/user.json'), 'utf8'));
    describe('sortBySchema', () => {
        it('should sort object keys according to schema property order', () => {
            const result = (0, sorter_1.sortBySchema)({ object: userObject, schema });
            const keys = Object.keys(result);
            const expectedOrder = ['name', 'age', 'email', 'address', 'phone'];
            (0, chai_1.expect)(keys).to.deep.equal(expectedOrder);
        });
        it('should recursively sort nested objects', () => {
            const result = (0, sorter_1.sortBySchema)({ object: userObject, schema });
            const addressKeys = Object.keys(result.address);
            const expectedAddressOrder = ['street', 'city', 'country'];
            (0, chai_1.expect)(addressKeys).to.deep.equal(expectedAddressOrder);
        });
        it('should handle empty objects', () => {
            const result = (0, sorter_1.sortBySchema)({ object: {}, schema });
            (0, chai_1.expect)(result).to.deep.equal({});
        });
        it('should handle non-object inputs', () => {
            (0, chai_1.expect)((0, sorter_1.sortBySchema)({ object: null, schema })).to.be.null;
            (0, chai_1.expect)((0, sorter_1.sortBySchema)({ object: 'string', schema })).to.equal('string');
            (0, chai_1.expect)((0, sorter_1.sortBySchema)({ object: [], schema })).to.deep.equal([]);
        });
        it('should handle circular references', () => {
            const circularObj = { a: 1 };
            circularObj.self = circularObj;
            (0, chai_1.expect)(() => (0, sorter_1.sortBySchema)({ object: circularObj, schema }))
                .to.throw('Circular reference detected in object');
        });
        it('should handle schema pointers', () => {
            const fullSchema = {
                definitions: {
                    User: schema
                }
            };
            const result = (0, sorter_1.sortBySchema)({
                object: userObject,
                schema: fullSchema,
                options: { schemaPointer: '#/definitions/User' }
            });
            const keys = Object.keys(result);
            const expectedOrder = ['name', 'age', 'email', 'address', 'phone'];
            (0, chai_1.expect)(keys).to.deep.equal(expectedOrder);
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
            const result = (0, sorter_1.sortBySchema)({
                object: deepObject,
                schema,
                options: { maxDepth: 1 }
            });
            // Top level should be sorted
            (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['name', 'email', 'address']);
            // But nested address should remain unsorted due to maxDepth
            (0, chai_1.expect)(Object.keys(result.address)).to.deep.equal(['country', 'street', 'city']);
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
            const result = (0, sorter_1.sortBySchema)({ object: arrayObject, schema: arraySchema });
            (0, chai_1.expect)(result.users[0]).to.deep.equal({ name: 'Alice', age: 25 });
            (0, chai_1.expect)(result.users[1]).to.deep.equal({ name: 'Bob', age: 30 });
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
                    age: 25,
                    name: 'Alice'
                }
            };
            const result = (0, sorter_1.sortBySchema)({ object: refObject, schema: refSchema });
            (0, chai_1.expect)(Object.keys(result.user)).to.deep.equal(['name', 'age']);
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
                age: 25,
                name: 'Alice'
            };
            const result = (0, sorter_1.sortBySchema)({ object: allOfObject, schema: allOfSchema });
            (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['name', 'age']);
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
                age: 25,
                name: 'Alice'
            };
            const result = (0, sorter_1.sortBySchema)({ object: anyOfObject, schema: anyOfSchema });
            (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['name', 'age']);
        });
        it('should throw error for invalid schema pointer', () => {
            (0, chai_1.expect)(() => (0, sorter_1.sortBySchema)({
                object: userObject,
                schema,
                options: { schemaPointer: '#/invalid/pointer' }
            })).to.throw('Schema not found at pointer: #/invalid/pointer');
        });
        it('should handle schemas without properties', () => {
            const emptySchema = {
                type: 'object'
            };
            const result = (0, sorter_1.sortBySchema)({ object: userObject, schema: emptySchema });
            // Should return object with keys in alphabetical order
            const keys = Object.keys(result);
            const expectedOrder = ['address', 'age', 'email', 'name', 'phone'];
            (0, chai_1.expect)(keys).to.deep.equal(expectedOrder);
        });
    });
});
//# sourceMappingURL=sorter.test.js.map