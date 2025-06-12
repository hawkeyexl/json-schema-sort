"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = isObject;
exports.hasCircularReference = hasCircularReference;
exports.sortObjectKeys = sortObjectKeys;
exports.getObjectKeys = getObjectKeys;
/**
 * Check if value is a plain object
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/**
 * Check if object has circular references
 */
function hasCircularReference(object, seen = new Set()) {
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
function sortObjectKeys(object, keyOrder) {
    const sortedObj = {};
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
function getObjectKeys(object) {
    return Object.keys(object || {});
}
//# sourceMappingURL=utils.js.map