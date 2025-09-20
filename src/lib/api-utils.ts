/**
 * Utility functions for API data validation and error handling
 */

export interface ApiValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
  fallbackData?: T;
}

/**
 * Validates if the response data is an array
 */
export function validateArrayData<T>(
  data: any, 
  fallbackData: T,
  context: string
): ApiValidationResult<T> {
  if (!Array.isArray(data)) {
    console.warn(`${context}: data is not an array:`, data);
    return {
      isValid: false,
      error: `${context}: Expected array, got ${typeof data}`,
      fallbackData
    };
  }
  
  return {
    isValid: true,
    data: data as T
  };
}

/**
 * Validates if the response data has required properties
 */
export function validateObjectData<T>(
  data: any,
  requiredProps: string[],
  fallbackData: T,
  context: string
): ApiValidationResult<T> {
  if (!data || typeof data !== 'object') {
    console.warn(`${context}: data is not an object:`, data);
    return {
      isValid: false,
      error: `${context}: Expected object, got ${typeof data}`,
      fallbackData
    };
  }

  const missingProps = requiredProps.filter(prop => !(prop in data));
  if (missingProps.length > 0) {
    console.warn(`${context}: Missing required properties:`, missingProps);
    return {
      isValid: false,
      error: `${context}: Missing properties: ${missingProps.join(', ')}`,
      fallbackData
    };
  }

  return {
    isValid: true,
    data: data as T
  };
}

/**
 * Safe array operations with fallback
 */
export function safeArrayOperation<T>(
  array: any[] | undefined | null,
  operation: (arr: T[]) => any,
  fallback: any,
  context: string
): any {
  if (!Array.isArray(array)) {
    console.warn(`${context}: Cannot perform operation on non-array:`, array);
    return fallback;
  }
  
  try {
    return operation(array as T[]);
  } catch (error) {
    console.error(`${context}: Error during array operation:`, error);
    return fallback;
  }
}

/**
 * Safe object property access with fallback
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return fallback;
      }
    }
    
    return result !== undefined ? result : fallback;
  } catch (error) {
    console.warn(`safeGet: Error accessing path "${path}":`, error);
    return fallback;
  }
} 