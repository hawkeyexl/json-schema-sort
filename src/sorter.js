const { DEFAULT_MAX_DEPTH } = require('./constants');
const { isObject, hasCircularReference, sortObjectKeys } = require('./utils');
const { resolveSchema, resolveRef, findMatchingSchema, mergeSchemaProperties } = require('./schema-resolver');

/**
 * Sort an object by schema
 * @param {object} params - Parameters object
 * @param {object} params.object - The object to sort
 * @param {object} params.schema - The schema document
 * @param {object} params.options - Options object
 * @param {number} params.options.maxDepth - Maximum recursion depth
 * @param {string} params.options.schemaPointer - JSON Pointer to sub-schema
 * @returns {object} Sorted object
 */
function sortBySchema({ object, schema, options = {} }) {
  const { maxDepth = DEFAULT_MAX_DEPTH, schemaPointer } = options;
  
  if (!isObject(object) || !isObject(schema)) {
    return object;
  }
  
  // Check for circular references
  if (hasCircularReference(object)) {
    throw new Error('Circular reference detected in object');
  }
  
  // Resolve schema pointer if provided
  let targetSchema = schema;
  if (schemaPointer) {
    targetSchema = resolveSchema(schema, schemaPointer);
    if (!targetSchema) {
      throw new Error(`Schema not found at pointer: ${schemaPointer}`);
    }
  }
  
  return sortObject(object, targetSchema, schema, 0, maxDepth);
}

/**
 * Recursively sort an object
 * @param {object} object - The object to sort
 * @param {object} schema - The schema to use for sorting
 * @param {object} rootSchema - The root schema document for resolving $refs
 * @param {number} currentDepth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {object} Sorted object
 */
function sortObject(object, schema, rootSchema, currentDepth, maxDepth) {
  if (!isObject(object) || currentDepth >= maxDepth) {
    return object;
  }
  
  if (!isObject(schema)) {
    return object;
  }
  
  // Handle $ref
  if (schema.$ref) {
    const resolvedSchema = resolveRef(rootSchema, schema.$ref);
    if (resolvedSchema) {
      return sortObject(object, resolvedSchema, rootSchema, currentDepth, maxDepth);
    }
  }
  
  // Handle allOf - merge all schemas
  if (Array.isArray(schema.allOf)) {
    const merged = mergeSchemaProperties(schema.allOf);
    const mergedSchema = { properties: merged.properties };
    return sortObject(object, mergedSchema, rootSchema, currentDepth, maxDepth);
  }
  
  // Handle anyOf/oneOf - find best matching schema
  if (Array.isArray(schema.anyOf)) {
    const matchingSchema = findMatchingSchema(object, schema.anyOf);
    if (matchingSchema) {
      return sortObject(object, matchingSchema, rootSchema, currentDepth, maxDepth);
    }
  }
  
  if (Array.isArray(schema.oneOf)) {
    const matchingSchema = findMatchingSchema(object, schema.oneOf);
    if (matchingSchema) {
      return sortObject(object, matchingSchema, rootSchema, currentDepth, maxDepth);
    }
  }
  
  // Get property order from schema
  const propertyOrder = getPropertyOrder(schema);
  
  // Sort the object
  const sortedObj = sortObjectKeys(object, propertyOrder);
  
  // Recursively sort nested objects
  const result = {};
  for (const [key, value] of Object.entries(sortedObj)) {
    if (Array.isArray(value)) {
      result[key] = sortArray(value, schema.properties?.[key]?.items, rootSchema, currentDepth + 1, maxDepth);
    } else if (isObject(value)) {
      const nestedSchema = schema.properties?.[key];
      if (nestedSchema) {
        result[key] = sortObject(value, nestedSchema, rootSchema, currentDepth + 1, maxDepth);
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Extract property order from schema
 * @param {object} schema - The schema object
 * @returns {string[]} Array of property names in order
 */
function getPropertyOrder(schema) {
  if (!isObject(schema) || !schema.properties) {
    return [];
  }
  
  return Object.keys(schema.properties);
}

/**
 * Sort array items
 * @param {Array} array - The array to sort
 * @param {object} itemSchema - Schema for array items
 * @param {object} rootSchema - The root schema document for resolving $refs
 * @param {number} currentDepth - Current recursion depth
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {Array} Array with sorted items
 */
function sortArray(array, itemSchema, rootSchema, currentDepth, maxDepth) {
  if (!Array.isArray(array) || currentDepth >= maxDepth) {
    return array;
  }
  
  if (!itemSchema) {
    return array;
  }
  
  return array.map(item => {
    if (isObject(item)) {
      return sortObject(item, itemSchema, rootSchema, currentDepth, maxDepth);
    }
    return item;
  });
}

/**
 * Merge additional properties at the end
 * @param {object} sortedObj - Already sorted object
 * @param {object} originalObj - Original object with all properties
 * @param {string[]} schemaProps - Properties defined in schema
 * @returns {object} Object with additional properties merged
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

module.exports = {
  sortBySchema,
  sortObject,
  getPropertyOrder,
  sortArray,
  mergeAdditionalProperties
};