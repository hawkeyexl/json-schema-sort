import { SchemaType } from './constants';
import { AnySchema, JsonSchema, MergedSchemaProperties } from './types';
/**
 * Resolve schema at JSON Pointer
 */
export declare function resolveSchema(schema: AnySchema, pointer: string): AnySchema | null;
/**
 * Resolve $ref references
 */
export declare function resolveRef(schema: AnySchema, ref: string): AnySchema | null;
/**
 * Detect schema type
 */
export declare function detectSchemaType(schema: AnySchema): SchemaType;
/**
 * Find matching schema from anyOf/oneOf array
 */
export declare function findMatchingSchema(object: Record<string, unknown>, schemas: JsonSchema[]): JsonSchema | null;
/**
 * Merge properties from multiple schemas (for allOf)
 */
export declare function mergeSchemaProperties(schemas: JsonSchema[]): MergedSchemaProperties;
//# sourceMappingURL=schema-resolver.d.ts.map