/**
 * Check if value is a plain object
 */
export declare function isObject(value: unknown): value is Record<string, unknown>;
/**
 * Check if object has circular references
 */
export declare function hasCircularReference(object: unknown, seen?: Set<unknown>): boolean;
/**
 * Sort object keys according to specified order
 */
export declare function sortObjectKeys(object: Record<string, unknown>, keyOrder: string[]): Record<string, unknown>;
/**
 * Get all object keys
 */
export declare function getObjectKeys(object: Record<string, unknown> | null | undefined): string[];
//# sourceMappingURL=utils.d.ts.map