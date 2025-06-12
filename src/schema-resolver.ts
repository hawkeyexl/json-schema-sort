import * as jsonpointer from 'jsonpointer';
import { SCHEMA_TYPES, SchemaType } from './constants';
import { isObject } from './utils';
import { AnySchema, JsonSchema, MergedSchemaProperties } from './types';

/**
 * Resolve schema at JSON Pointer
 */
export function resolveSchema(schema: AnySchema, pointer: string): AnySchema | null {
  if (!pointer || pointer === '#') {
    return schema;
  }
  
  try {
    const result = jsonpointer.get(schema, pointer.replace(/^#/, ''));
    return result === undefined ? null : result;
  } catch {
    return null;
  }
}

/**
 * Resolve $ref references
 */
export function resolveRef(schema: AnySchema, ref: string): AnySchema | null {
  if (!ref || !ref.startsWith('#')) {
    // Only handle internal references for now
    return null;
  }
  
  return resolveSchema(schema, ref);
}

/**
 * Detect schema type
 */
export function detectSchemaType(schema: AnySchema): SchemaType {
  if (!isObject(schema)) {
    return SCHEMA_TYPES.GENERIC;
  }
  
  if ('openapi' in schema && schema.openapi) {
    return SCHEMA_TYPES.OPENAPI;
  }
  
  if ('asyncapi' in schema && schema.asyncapi) {
    return SCHEMA_TYPES.ASYNCAPI;
  }
  
  if (schema.$schema || schema.type || schema.properties) {
    return SCHEMA_TYPES.JSON_SCHEMA;
  }
  
  return SCHEMA_TYPES.GENERIC;
}

/**
 * Find matching schema from anyOf/oneOf array
 */
export function findMatchingSchema(object: Record<string, unknown>, schemas: JsonSchema[]): JsonSchema | null {
  if (!Array.isArray(schemas) || schemas.length === 0) {
    return null;
  }
  
  // Simple heuristic: find schema with most matching properties
  let bestMatch: JsonSchema | null = null;
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
 */
export function mergeSchemaProperties(schemas: JsonSchema[]): MergedSchemaProperties {
  if (!Array.isArray(schemas)) {
    return { properties: {}, propertyOrder: [] };
  }
  
  const mergedProperties: Record<string, JsonSchema> = {};
  const propertyOrder: string[] = [];
  
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