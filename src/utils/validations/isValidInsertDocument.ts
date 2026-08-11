import toBSON from 'mongodb-query-parser-esm'

import { isPlainObject } from './common'

const UPDATE_OPERATORS: ReadonlySet<string> = new Set([
  '$set', '$unset', '$push', '$pull', '$addToSet', '$pop', '$rename', '$inc', '$mul',
  '$min', '$max', '$currentDate', '$setOnInsert', '$bit', '$pullAll', '$each', '$position',
  '$sort', '$slice'
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
      if (isPlainObject(value)) {
        stack.push({
          obj: value as Record<string, unknown>,
          isRoot: false,
          path: currentPath
        })
      } else if (Array.isArray(value)) {
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
function parseAndValidate(str: string): ReturnValidation {
  if (!str?.trim()) return { error: 'Insert document cannot be empty' }
  let obj: unknown
  try {
    obj = toBSON(str)
  } catch (error) {
    return { error: `Invalid syntax: ${(error as Error).message}` }
  }
  if (!isPlainObject(obj)) return { error: 'Must be a valid object' }
  return validateFields(obj as Record<string, unknown>) ?? {}
}

/**
 * Validates a single top-level `key: value` fragment (as produced by
 * `getTopLevelEntries`) using the same rules as a full document, since a
 * fragment always represents exactly one top-level property of the real doc.
 */
export function isValidInsertDocumentEntry(entryText: string): ReturnValidation {
  const trimmed = entryText.trim().replace(/,$/, '')
  return parseAndValidate(`{ ${trimmed} }`)
}

export default function isValidInsertDocument(str: string): ReturnValidation {
  return parseAndValidate(str)
}
