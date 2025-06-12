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
exports.resolveSchema = resolveSchema;
exports.resolveRef = resolveRef;
exports.detectSchemaType = detectSchemaType;
exports.findMatchingSchema = findMatchingSchema;
exports.mergeSchemaProperties = mergeSchemaProperties;
const jsonpointer = __importStar(require("jsonpointer"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
/**
 * Resolve schema at JSON Pointer
 */
function resolveSchema(schema, pointer) {
    if (!pointer || pointer === '#') {
        return schema;
    }
    try {
        const result = jsonpointer.get(schema, pointer.replace(/^#/, ''));
        return result === undefined ? null : result;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Resolve $ref references
 */
function resolveRef(schema, ref) {
    if (!ref || !ref.startsWith('#')) {
        // Only handle internal references for now
        return null;
    }
    return resolveSchema(schema, ref);
}
/**
 * Detect schema type
 */
function detectSchemaType(schema) {
    if (!(0, utils_1.isObject)(schema)) {
        return constants_1.SCHEMA_TYPES.GENERIC;
    }
    if ('openapi' in schema && schema.openapi) {
        return constants_1.SCHEMA_TYPES.OPENAPI;
    }
    if ('asyncapi' in schema && schema.asyncapi) {
        return constants_1.SCHEMA_TYPES.ASYNCAPI;
    }
    if (schema.$schema || schema.type || schema.properties) {
        return constants_1.SCHEMA_TYPES.JSON_SCHEMA;
    }
    return constants_1.SCHEMA_TYPES.GENERIC;
}
/**
 * Find matching schema from anyOf/oneOf array
 */
function findMatchingSchema(object, schemas) {
    if (!Array.isArray(schemas) || schemas.length === 0) {
        return null;
    }
    // Simple heuristic: find schema with most matching properties
    let bestMatch = null;
    let bestScore = -1;
    for (const schema of schemas) {
        if (!(0, utils_1.isObject)(schema) || !schema.properties) {
            continue;
        }
        const schemaProps = Object.keys(schema.properties);
        const objectProps = Object.keys(object || {});
        const matchingProps = schemaProps.filter(prop => objectProps.includes(prop));
        const score = matchingProps.length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = schema;
        }
    }
    return bestMatch;
}
/**
 * Merge properties from multiple schemas (for allOf)
 */
function mergeSchemaProperties(schemas) {
    if (!Array.isArray(schemas)) {
        return { properties: {}, propertyOrder: [] };
    }
    const mergedProperties = {};
    const propertyOrder = [];
    for (const schema of schemas) {
        if ((0, utils_1.isObject)(schema) && schema.properties) {
            Object.assign(mergedProperties, schema.properties);
            // Maintain order by adding new properties at the end
            const schemaProps = Object.keys(schema.properties);
            for (const prop of schemaProps) {
                if (!propertyOrder.includes(prop)) {
                    propertyOrder.push(prop);
                }
            }
        }
    }
    return {
        properties: mergedProperties,
        propertyOrder
    };
}
//# sourceMappingURL=schema-resolver.js.map