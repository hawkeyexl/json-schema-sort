const jsonpointer = require('jsonpointer');
const { SCHEMA_TYPES } = require('./constants');
const { isObject } = require('./utils');

/**
 * Resolve schema at JSON Pointer
 * @param {object} schema - The schema document
 * @param {string} pointer - JSON Pointer string
 * @returns {object|null} Resolved schema or null if not found
 */
function resolveSchema(schema, pointer) {
  if (!pointer || pointer === '#') {
    return schema;
  }
  
  try {
    const result = jsonpointer.get(schema, pointer.replace(/^#/, ''));
    return result === undefined ? null : result;
  } catch (error) {
    return null;
  }
}

/**
 * Resolve $ref references
 * @param {object} schema - The schema document
 * @param {string} ref - The $ref value
 * @returns {object|null} Resolved schema or null if not found
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
 * @param {object} schema - The schema to analyze
 * @returns {string} The detected schema type
 */
function detectSchemaType(schema) {
  if (!isObject(schema)) {
    return SCHEMA_TYPES.GENERIC;
  }
  
  if (schema.openapi) {
    return SCHEMA_TYPES.OPENAPI;
  }
  
  if (schema.asyncapi) {
    return SCHEMA_TYPES.ASYNCAPI;
  }
  
  if (schema.$schema || schema.type || schema.properties) {
    return SCHEMA_TYPES.JSON_SCHEMA;
  }
  
  return SCHEMA_TYPES.GENERIC;
}

/**
 * Find matching schema from anyOf/oneOf array
 * @param {object} object - The object to match
 * @param {object[]} schemas - Array of schemas to match against
 * @returns {object|null} Best matching schema or null
 */
function findMatchingSchema(object, schemas) {
  if (!Array.isArray(schemas) || schemas.length === 0) {
    return null;
  }
  
  // Simple heuristic: find schema with most matching properties
  let bestMatch = null;
  let bestScore = -1;
  
  for (const schema of schemas) {
    if (!isObject(schema) || !schema.properties) {
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
 * @param {object[]} schemas - Array of schemas to merge
 * @returns {object} Merged schema properties
 */
function mergeSchemaProperties(schemas) {
  if (!Array.isArray(schemas)) {
    return {};
  }
  
  const mergedProperties = {};
  const propertyOrder = [];
  
  for (const schema of schemas) {
    if (isObject(schema) && schema.properties) {
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

module.exports = {
  resolveSchema,
  resolveRef,
  detectSchemaType,
  findMatchingSchema,
  mergeSchemaProperties
};