"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../src/index");
describe('Integration Tests', () => {
    it('should work end-to-end with complex nested structures', () => {
        const complexSchema = {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        personalInfo: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                age: { type: 'number' },
                                email: { type: 'string' }
                            }
                        },
                        preferences: {
                            type: 'object',
                            properties: {
                                theme: { type: 'string' },
                                language: { type: 'string' }
                            }
                        }
                    }
                },
                settings: {
                    type: 'object',
                    properties: {
                        notifications: { type: 'boolean' },
                        privacy: { type: 'string' }
                    }
                }
            }
        };
        const complexObject = {
            settings: {
                privacy: 'public',
                notifications: true
            },
            user: {
                preferences: {
                    language: 'en',
                    theme: 'dark'
                },
                personalInfo: {
                    email: 'john@example.com',
                    age: 30,
                    name: 'John Doe'
                }
            },
            metadata: {
                createdAt: '2023-01-01',
                version: '1.0'
            }
        };
        const result = (0, index_1.sortBySchema)({ object: complexObject, schema: complexSchema });
        // Check top-level order
        (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['user', 'settings', 'metadata']);
        // Check nested user object
        (0, chai_1.expect)(Object.keys(result.user)).to.deep.equal(['personalInfo', 'preferences']);
        // Check deeply nested personalInfo
        (0, chai_1.expect)(Object.keys(result.user.personalInfo)).to.deep.equal(['name', 'age', 'email']);
        // Check preferences
        (0, chai_1.expect)(Object.keys(result.user.preferences)).to.deep.equal(['theme', 'language']);
        // Check settings
        (0, chai_1.expect)(Object.keys(result.settings)).to.deep.equal(['notifications', 'privacy']);
        // Check that additional properties (metadata) are sorted alphabetically at the end
        (0, chai_1.expect)(Object.keys(result.metadata)).to.deep.equal(['createdAt', 'version']);
    });
    it('should handle OpenAPI-style schemas', () => {
        const openApiSchema = {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0'
            },
            components: {
                schemas: {
                    User: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            created_at: { type: 'string' }
                        }
                    }
                }
            }
        };
        const userObject = {
            email: 'user@example.com',
            created_at: '2023-01-01',
            name: 'Test User',
            id: 1
        };
        const result = (0, index_1.sortBySchema)({
            object: userObject,
            schema: openApiSchema,
            options: { schemaPointer: '#/components/schemas/User' }
        });
        (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['id', 'name', 'email', 'created_at']);
    });
    it('should handle arrays with mixed object structures', () => {
        const schema = {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            priority: { type: 'number' },
                            title: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                }
            }
        };
        const arrayObject = {
            items: [
                {
                    description: 'First item',
                    priority: 1,
                    title: 'Item 1'
                },
                {
                    title: 'Item 2',
                    description: 'Second item',
                    priority: 2
                }
            ]
        };
        const result = (0, index_1.sortBySchema)({ object: arrayObject, schema });
        (0, chai_1.expect)(result.items[0]).to.deep.equal({
            priority: 1,
            title: 'Item 1',
            description: 'First item'
        });
        (0, chai_1.expect)(result.items[1]).to.deep.equal({
            priority: 2,
            title: 'Item 2',
            description: 'Second item'
        });
    });
});
//# sourceMappingURL=integration.test.js.map