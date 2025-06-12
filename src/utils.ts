/**
 * Check if value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if object has circular references
 */
export function hasCircularReference(object: unknown, seen = new Set<unknown>()): boolean {
  if (seen.has(object)) {
    return true;
  }
  
  if (!isObject(object)) {
    return false;
  }
  
  seen.add(object);
  
  for (const value of Object.values(object)) {
    if (isObject(value) && hasCircularReference(value, seen)) {
      return true;
    }
  }
  
  seen.delete(object);
  return false;
}

/**
 * Sort object keys according to specified order
 */
export function sortObjectKeys(object: Record<string, unknown>, keyOrder: string[]): Record<string, unknown> {
  const sortedObj: Record<string, unknown> = {};
  const objectKeys = Object.keys(object);
  
  // Add keys in the specified order
  for (const key of keyOrder) {
    if (objectKeys.includes(key)) {
      sortedObj[key] = object[key];
    }
  }
  
  // Add remaining keys alphabetically
  const remainingKeys = objectKeys
    .filter(key => !keyOrder.includes(key))
    .sort();
    
  for (const key of remainingKeys) {
    sortedObj[key] = object[key];
  }
  
  return sortedObj;
}

/**
 * Get all object keys
 */
export function getObjectKeys(object: Record<string, unknown> | null | undefined): string[] {
  return Object.keys(object || {});
}