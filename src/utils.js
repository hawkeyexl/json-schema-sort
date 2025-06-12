/**
 * Check if value is a plain object
 * @param {*} value - The value to check
 * @returns {boolean} True if value is a plain object
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if object has circular references
 * @param {object} object - The object to check
 * @param {Set} seen - Set of already seen objects
 * @returns {boolean} True if circular reference is detected
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
 * @param {object} object - The object to sort
 * @param {string[]} keyOrder - Array of keys in desired order
 * @returns {object} New object with sorted keys
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
 * @param {object} object - The object to get keys from
 * @returns {string[]} Array of object keys
 */
function getObjectKeys(object) {
  return Object.keys(object || {});
}

module.exports = {
  isObject,
  hasCircularReference,
  sortObjectKeys,
  getObjectKeys
};