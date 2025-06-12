import { AnySchema, JsonSchema, SortBySchemaParams } from './types';
/**
 * Sort an object by schema
 */
export declare function sortBySchema({ object, schema, options }: SortBySchemaParams): unknown;
/**
 * Recursively sort an object
 */
export declare function sortObject(object: Record<string, unknown>, schema: AnySchema, rootSchema: AnySchema, currentDepth: number, maxDepth: number): Record<string, unknown>;
/**
 * Extract property order from schema
 */
export declare function getPropertyOrder(schema: AnySchema): string[];
/**
 * Sort array items
 */
export declare function sortArray(array: unknown[], itemSchema: JsonSchema | JsonSchema[] | undefined, rootSchema: AnySchema, currentDepth: number, maxDepth: number): unknown[];
/**
 * Merge additional properties at the end
 */
export declare function mergeAdditionalProperties(sortedObj: Record<string, unknown>, originalObj: Record<string, unknown>, schemaProps: string[]): Record<string, unknown>;
//# sourceMappingURL=sorter.d.ts.map