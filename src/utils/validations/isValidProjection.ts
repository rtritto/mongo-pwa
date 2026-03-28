import toBSON from '@/utils/mongodb-query-parser'

const PROJECTION_OPERATORS = new Set(['$slice', '$elemMatch', '$meta'])

type ProjectionValue = number | boolean | Record<string, unknown>

/**
 * Validates a string as a MongoDB projection.
 * 
 * A projection must be a non-null object where each key is a field name and each value is either:
 * - 0 or 1 (number) to indicate exclusion/inclusion
 * - true or false (boolean) to indicate inclusion/exclusion
 * - an object with exactly one of the allowed projection operators ($slice, $elemMatch, $meta) to indicate inclusion
 * 
 * Additionally, you cannot mix inclusion and exclusion in the same projection (except for _id: 0).
 * 
 * Examples:
 * // ✅ Valid
 * isValidProjection('{}')
 * isValidProjection('{ "name": 1, "age": 1 }')
 * isValidProjection('{ "password": 0, "secret": 0 }')
 * isValidProjection('{ "name": 1, "_id": 0 }')
 * isValidProjection('{ "name": true, "age": false }')
 * isValidProjection('{ "tags": { "$slice": 5 } }')
 * isValidProjection('{ "items": { "$elemMatch": { "qty": 1 } } }')
 * 
 * // ❌ Invalid
 * isValidProjection('{ "name": 1, "age": 0 }')
 * isValidProjection('{ "name": 2 }')
 * isValidProjection('{ "name": "hello" }')
 * isValidProjection('[1, 2, 3]')
 * isValidProjection('not json')
 * isValidProjection('{ "a": { "$unknown": 1 } }')
 */
export default function isValidProjection(str: string): ReturnValidation {
  let obj: unknown

  try {
    obj = toBSON(str)
  } catch {
    return {
      error: 'Projection has invalid JSON'
    }
  }

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    // Is null or Array
    return {
      error: 'Projection must be a non-null object'
    }
  }

  const entries = Object.entries(obj as Record<string, ProjectionValue>)

  if (entries.length === 0) {
    // Empty projection {} = All fields
    return {}
  }

  let hasInclusion = false
  let hasExclusion = false

  for (const [key, value] of entries) {
    if (!key) {
      return {
        error: 'Projection contains an empty key'
      }
    }

    // Numeric value: only 0 or 1
    if (typeof value === 'number') {
      if (value !== 0 && value !== 1) {
        return {
          error: 'Projection values must be 0 or 1'
        }
      }
      if (value === 1) {
        hasInclusion = true
      } else if (value === 0 && key !== '_id') {
        // _id: 0 is always allowed, does not count as "exclusion"
        hasExclusion = true
      }
    } else if (typeof value === 'boolean') {
      // Boolean value: true = 1, false = 0
      if (value) {
        hasInclusion = true
      } else if (key !== '_id') {
        hasExclusion = true
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Projection operators: $slice, $elemMatch, $meta
      const opKeys = Object.keys(value)
      if (opKeys.length !== 1) {
        return {
          error: 'Projection operators must have exactly one key'
        }
      }
      if (!PROJECTION_OPERATORS.has(opKeys[0])) {
        return {
          error: `Invalid projection operator: ${opKeys[0]}`
        }
      }
      // Operators count as inclusion
      hasInclusion = true
    } else {
      // Any other type → invalid
      return {
        error: 'Invalid projection value type'
      }
    }
  }

  // Cannot mix inclusion and exclusion (except for _id: 0)
  if (hasInclusion && hasExclusion) {
    return {
      error: 'Cannot mix inclusion and exclusion in projection'
    }
  }

  return {}
}
