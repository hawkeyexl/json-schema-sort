"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortBySchema = sortBySchema;
exports.sortObject = sortObject;
exports.getPropertyOrder = getPropertyOrder;
exports.sortArray = sortArray;
exports.mergeAdditionalProperties = mergeAdditionalProperties;
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const schema_resolver_1 = require("./schema-resolver");
/**
 * Sort an object by schema
 */
function sortBySchema({ object, schema, options = {} }) {
    const { maxDepth = constants_1.DEFAULT_MAX_DEPTH, schemaPointer } = options;
    if (!(0, utils_1.isObject)(object) || !(0, utils_1.isObject)(schema)) {
        return object;
    }
    // Check for circular references
    if ((0, utils_1.hasCircularReference)(object)) {
        throw new Error('Circular reference detected in object');
    }
    // Resolve schema pointer if provided
    let targetSchema = schema;
    if (schemaPointer) {
        const resolvedSchema = (0, schema_resolver_1.resolveSchema)(schema, schemaPointer);
        if (!resolvedSchema) {
            throw new Error(`Schema not found at pointer: ${schemaPointer}`);
        }
        targetSchema = resolvedSchema;
    }
    return sortObject(object, targetSchema, schema, 0, maxDepth);
}
/**
 * Recursively sort an object
 */
function sortObject(object, schema, rootSchema, currentDepth, maxDepth) {
    var _a, _b, _c;
    if (!(0, utils_1.isObject)(object) || currentDepth >= maxDepth) {
        return object;
    }
    if (!(0, utils_1.isObject)(schema)) {
        return object;
    }
    // Handle $ref
    if (schema.$ref) {
        const resolvedSchema = (0, schema_resolver_1.resolveRef)(rootSchema, schema.$ref);
        if (resolvedSchema) {
            return sortObject(object, resolvedSchema, rootSchema, currentDepth, maxDepth);
        }
    }
    // Handle allOf - merge all schemas
    if (Array.isArray(schema.allOf)) {
        const merged = (0, schema_resolver_1.mergeSchemaProperties)(schema.allOf);
        const mergedSchema = { properties: merged.properties };
        return sortObject(object, mergedSchema, rootSchema, currentDepth, maxDepth);
    }
    // Handle anyOf/oneOf - find best matching schema
    if (Array.isArray(schema.anyOf)) {
        const matchingSchema = (0, schema_resolver_1.findMatchingSchema)(object, schema.anyOf);
        if (matchingSchema) {
            return sortObject(object, matchingSchema, rootSchema, currentDepth, maxDepth);
        }
    }
    if (Array.isArray(schema.oneOf)) {
        const matchingSchema = (0, schema_resolver_1.findMatchingSchema)(object, schema.oneOf);
        if (matchingSchema) {
            return sortObject(object, matchingSchema, rootSchema, currentDepth, maxDepth);
        }
    }
    // Get property order from schema
    const propertyOrder = getPropertyOrder(schema);
    // Sort the object
    const sortedObj = (0, utils_1.sortObjectKeys)(object, propertyOrder);
    // Recursively sort nested objects
    const result = {};
    for (const [key, value] of Object.entries(sortedObj)) {
        if (Array.isArray(value)) {
            const itemSchema = (_b = (_a = schema.properties) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.items;
            result[key] = sortArray(value, itemSchema, rootSchema, currentDepth + 1, maxDepth);
        }
        else if ((0, utils_1.isObject)(value)) {
            const nestedSchema = (_c = schema.properties) === null || _c === void 0 ? void 0 : _c[key];
            if (nestedSchema) {
                result[key] = sortObject(value, nestedSchema, rootSchema, currentDepth + 1, maxDepth);
            }
            else {
                result[key] = value;
            }
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Extract property order from schema
 */
function getPropertyOrder(schema) {
    if (!(0, utils_1.isObject)(schema) || !schema.properties) {
        return [];
    }
    return Object.keys(schema.properties);
}
/**
 * Sort array items
 */
function sortArray(array, itemSchema, rootSchema, currentDepth, maxDepth) {
    if (!Array.isArray(array) || currentDepth >= maxDepth) {
        return array;
    }
    if (!itemSchema) {
        return array;
    }
    // Handle array of schemas case
    if (Array.isArray(itemSchema)) {
        return array; // For now, skip complex array schemas
    }
    return array.map(item => {
        if ((0, utils_1.isObject)(item)) {
            return sortObject(item, itemSchema, rootSchema, currentDepth, maxDepth);
        }
        return item;
    });
}
/**
 * Merge additional properties at the end
 */
function mergeAdditionalProperties(sortedObj, originalObj, schemaProps) {
    const result = { ...sortedObj };
    const additionalProps = Object.keys(originalObj)
        .filter(key => !schemaProps.includes(key))
        .sort();
    for (const prop of additionalProps) {
        result[prop] = originalObj[prop];
    }
    return result;
}
//# sourceMappingURL=sorter.js.map