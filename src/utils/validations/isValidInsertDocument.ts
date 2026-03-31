import toBSON from 'mongodb-query-parser-esm'

import { isPlainObject } from './common'

const UPDATE_OPERATORS: ReadonlySet<string> = new Set([
  '$set', '$unset', '$push', '$pull', '$addToSet',
  '$pop', '$rename', '$inc', '$mul', '$min', '$max',
  '$currentDate', '$setOnInsert', '$bit',
  '$pullAll', '$each', '$position', '$sort', '$slice'
])

export type ReturnValidation = { error?: string }

/**
 * Validates document fields iteratively (Stack-based).
 */
function validateFields(root: Record<string, unknown>): ReturnValidation | undefined {
  const stack: { obj: Record<string, unknown>; isRoot: boolean; path: string }[] = [
    { obj: root, isRoot: true, path: '' }
  ]

  while (stack.length > 0) {
    const { obj, isRoot, path } = stack.pop()!

    // The for...in loop is the fastest way in V8 to iterate over object keys
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key

      // Check for empty or whitespace-only key
      if (!key.trim()) {
        return { error: `Empty or whitespace-only field name at '${path || 'root'}'` }
      }

      // Check operator '$' (36 is the charCode of '$' -> ultra-fast)
      if (key.codePointAt(0) === 36) {
        if (isRoot) {
          return { error: `Top-level field cannot start with '$' (found '${key}')` }
        }
        if (UPDATE_OPERATORS.has(key)) {
          return { error: `Update operator '${key}' is not allowed in insert document at '${currentPath}'` }
        }
      }

      const value = obj[key]

      // If it's a nested object, push it onto the stack
      if (isPlainObject(value)) {
        stack.push({
          obj: value as Record<string, unknown>,
          isRoot: false,
          path: currentPath
        })
      }
      // If it's an array, analyze only the objects inside
      else if (Array.isArray(value)) {
        // eslint-disable-next-line unicorn/no-for-loop
        for (let i = 0; i < value.length; i++) {
          const item = value[i]
          if (isPlainObject(item)) {
            stack.push({
              obj: item as Record<string, unknown>,
              isRoot: false,
              path: `${currentPath}[${i}]`
            })
          }
        }
      }
    }
  }

  // No error found
  return undefined
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
 * { "   ": "value" }          — whitespace field
 * "just a string"             — not an object
 */
export default function isValidInsertDocument(str: string): ReturnValidation {
  // Early return
  if (!str?.trim()) {
    return { error: 'Insert document cannot be empty' }
  }

  let obj: unknown

  // Safe parsing
  try {
    obj = toBSON(str)
  } catch (error) {
    return { error: `Invalid syntax: ${(error as Error).message}` }
  }

  // Must be a plain object {} (not array, not string, not null)
  if (!isPlainObject(obj)) {
    return { error: 'Must be a valid object' }
  }

  // {} is valid — MongoDB will automatically add _id

  const fieldError = validateFields(obj as Record<string, unknown>)

  if (fieldError) {
    return fieldError
  }

  return {}
}
