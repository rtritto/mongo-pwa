import toBSON from '@/utils/mongodb-query-parser'
import { isPlainObject } from './common'

// Top-level operators allowed in a filter
const TOP_LEVEL_QUERY_OPS = new Set([
  '$and', '$or', '$nor', '$not',
  '$expr', '$text', '$where', '$comment',
  '$jsonSchema'
])

// Field-level operators
const FIELD_QUERY_OPS = new Set([
  '$eq', '$gt', '$gte', '$lt', '$lte', '$ne',
  '$in', '$nin',
  '$exists', '$type',
  '$regex', '$options',
  '$mod', '$all', '$size', '$elemMatch',
  '$not',
  '$geoIntersects', '$geoWithin', '$near', '$nearSphere',
  '$bitsAllClear', '$bitsAllSet', '$bitsAnyClear', '$bitsAnySet'
])

/**
 * Recursively validates the values of a field in the filter.
 * If the value is an object, its keys must be valid operators
 * or normal fields (nested dot notation).
 */
const validateFieldValue = (value: unknown): boolean => {
  if (!isPlainObject(value)) return true // primitives, arrays → ok

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') && !FIELD_QUERY_OPS.has(key)) return false
    // Nested object (e.g., { address: { city: "Rome" } }) → recursion
    if (!validateFieldValue(value[key])) return false
  }

  return true
}

/**
 * Validates a string as a MongoDB query (filter for find).
 *
 * Examples:
 * ✅ Valid
 * { "name": "Alice" }
 * { "age": { "$gte": 18 } }
 * { "$or": [{ "a": 1 }, { "b": 2 }] }
 * {}
 * 
 * ❌ Invalid
 * [1, 2, 3]
 * { "$fake": 1 }
 * { "age": { "$fake": 5 } }
 */
export default function isValidQuery(str: string): ReturnValidation {
  let obj: unknown

  try {
    obj = toBSON(str)
  } catch {
    return {
      error: 'Query has invalid JSON'
    }
  }

  if (!isPlainObject(obj)) return { error: 'Query must be a non-null object' }

  for (const [key, value] of Object.entries(obj)) {
    if (!key) {
      return {
        error: 'Query contains an empty key'
      }
    }

    if (key.startsWith('$')) {
      // top-level operator → must be known
      if (!TOP_LEVEL_QUERY_OPS.has(key)) {
        return {
          error: `Invalid top-level operator: ${key}`
        }
      }

      // $and, $or, $nor require an array of objects
      if (['$and', '$or', '$nor'].includes(key)) {
        if (!Array.isArray(value)) return { error: `${key} operator requires an array` }
        for (const item of value) {
          if (!isPlainObject(item)) {
            return {
              error: `${key} operator requires an array of objects`
            }
          }
          // Recursive validation
          const validation = isValidQuery(JSON.stringify(item))
          if ('error' in validation) {
            return {
              error: `Invalid query in ${key} operator: ${validation.error}`
            }
          }
        }
      }
    } else {
      // Normal field → validate its operators
      if (!validateFieldValue(value)) {
        return {
          error: 'Invalid field value'
        }
      }
    }
  }

  return {}
}
