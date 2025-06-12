import { DEFAULT_MAX_DEPTH } from './constants';
import { isObject, hasCircularReference, sortObjectKeys } from './utils';
import { resolveSchema, resolveRef, findMatchingSchema, mergeSchemaProperties } from './schema-resolver';
import { AnySchema, JsonSchema, SortBySchemaParams } from './types';

/**
 * Sort an object by schema
 */
export function sortBySchema({ object, schema, options = {} }: SortBySchemaParams): unknown {
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
    const resolvedSchema = resolveSchema(schema, schemaPointer);
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
export function sortObject(
  object: Record<string, unknown>, 
  schema: AnySchema, 
  rootSchema: AnySchema, 
  currentDepth: number, 
  maxDepth: number
): Record<string, unknown> {
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
    const mergedSchema: JsonSchema = { properties: merged.properties };
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
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sortedObj)) {
    if (Array.isArray(value)) {
      const itemSchema = (schema.properties?.[key] as JsonSchema)?.items;
      result[key] = sortArray(value, itemSchema, rootSchema, currentDepth + 1, maxDepth);
    } else if (isObject(value)) {
      const nestedSchema = schema.properties?.[key];
      if (nestedSchema) {
        result[key] = sortObject(value as Record<string, unknown>, nestedSchema as AnySchema, rootSchema, currentDepth + 1, maxDepth);
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
 */
export function getPropertyOrder(schema: AnySchema): string[] {
  if (!isObject(schema) || !schema.properties) {
    return [];
  }
  
  return Object.keys(schema.properties);
}

/**
 * Sort array items
 */
export function sortArray(
  array: unknown[], 
  itemSchema: JsonSchema | JsonSchema[] | undefined, 
  rootSchema: AnySchema, 
  currentDepth: number, 
  maxDepth: number
): unknown[] {
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
    if (isObject(item)) {
      return sortObject(item, itemSchema, rootSchema, currentDepth, maxDepth);
    }
    return item;
  });
}

/**
 * Merge additional properties at the end
 */
export function mergeAdditionalProperties(
  sortedObj: Record<string, unknown>, 
  originalObj: Record<string, unknown>, 
  schemaProps: string[]
): Record<string, unknown> {
  const result = { ...sortedObj };
  const additionalProps = Object.keys(originalObj)
    .filter(key => !schemaProps.includes(key))
    .sort();
    
  for (const prop of additionalProps) {
    result[prop] = originalObj[prop];
  }
  
  return result;
}