import toBSON from '@/utils/mongodb-query-parser'
import { isPlainObject } from './common'

// Update operators NOT allowed in an insert document
const UPDATE_OPERATORS = new Set([
  '$set', '$unset', '$push', '$pull', '$addToSet',
  '$pop', '$rename', '$inc', '$mul', '$min', '$max',
  '$currentDate', '$setOnInsert', '$bit',
  '$pullAll', '$each', '$position', '$sort', '$slice'
])

/**
 * Recursively validates the fields of a document.
 * - No empty fields
 * - No update operators ($set, $push, etc.)
 * - Nested objects → recursion
 */
function validateFields(obj: Record<string, unknown>, isRoot: boolean): ReturnValidation {
  for (const [key, value] of Object.entries(obj)) {
    // Empty field
    if (!key) {
      return {
        error: 'Empty field'
      }
    }

    // Fields starting with $ at the top-level → always forbidden
    // Fields with $ nested → forbidden if they are update operators
    if (key.startsWith('$')) {
      if (isRoot) return {
        error: 'Top-level fields cannot start with $'
      }
      if (UPDATE_OPERATORS.has(key)) {
        return {
          error: `Update operator ${key} is not allowed in insert document`
        }
      }
    }

    // Array → validate each object element recursively
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isPlainObject(item)) {
          const validation = validateFields(item, false)
          if (validation.error) {
            return {
              error: 'Invalid document in array'
            }
          }
        }
      }
    }

    // Nested object → recursion
    if (isPlainObject(value)) {
      const validation = validateFields(value, false)
      if (validation.error) {
        return {
          error: 'Invalid nested document'
        }
      }
    }
  }

  return {}
}

/**
 * Validates a string as a MongoDB insert document.
 *
 * Examples:
 * ✅ Valid
 * {}
 * { "name": "Alice", "age": 30 }
 * { "_id": "custom-id", "status": "active" }
 * { "tags": ["a", "b"], "meta": { "views": 0 } }
 *
 * ❌ Invalid
 * []                          — array (use insertMany)
 * { "$set": { "name": "X" } } — update operator, not a document
 * { "": "value" }             — empty field
 * "just a string"             — not an object
 */
export default function isValidInsertDocument(str: string): ReturnValidation {
  let obj: unknown

  // Must be valid JSON
  try {
    obj = toBSON(str)
  } catch /* (error) */ {
    // console.error('Error parsing JSON:', error)
    return {
      error: 'Invalid JSON format'
    }
  }

  // Must be an object, not null, not an array
  if (!isPlainObject(obj)) return {
    error: 'Not a valid object'
  }

  // {} is valid — MongoDB will automatically add _id

  // Validate all fields recursively
  return validateFields(obj, true)
}
