import toBSON from 'mongodb-query-parser-esm'

const PROJECTION_OPERATORS: ReadonlySet<string> = new Set(['$slice', '$elemMatch', '$meta'])

export default function isValidProjection(str: string): { error?: string } {
  if (!str?.trim()) {
    return {
      error: 'Empty'
    }
  }

  let obj: unknown

  try {
    obj = toBSON(str)
  } catch {
    return {
      error: 'Projection has invalid syntax'
    }
  }

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return {
      error: 'Projection must be a non-null object'
    }
  }

  const entries = Object.entries(obj as Record<string, unknown>)

  if (entries.length === 0) {
    return {}
  }

  let hasInclusion = false
  let hasExclusion = false

  for (const [key, value] of entries) {
    if (!key.trim()) {
      return {
        error: 'Projection contains an empty or whitespace key'
      }
    }

    if (typeof value === 'number') {
      if (value !== 0 && value !== 1) {
        return {
          error: `Projection value for "${key}" must be 0 or 1`
        }
      }
      if (value === 1) {
        hasInclusion = true
      } else if (key !== '_id') {
        hasExclusion = true
      }
    } else if (typeof value === 'boolean') {
      if (value) {
        hasInclusion = true
      } else if (key !== '_id') {
        hasExclusion = true
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {

      const opObj = value as Record<string, unknown>
      const opKeys = Object.keys(opObj)

      if (opKeys.length !== 1) {
        return { error: `Projection for "${key}" must have exactly one operator` }
      }

      const opName = opKeys[0]
      if (!PROJECTION_OPERATORS.has(opName)) {
        return { error: `Invalid projection operator: ${opName}` }
      }

      const opVal = opObj[opName]

      // Validate operator values
      if (opName === '$meta' && typeof opVal !== 'string') {
        return {
          error: '$meta value must be a string (e.g. "textScore")'
        }
      }

      if (opName === '$elemMatch' && (typeof opVal !== 'object' || opVal === null || Array.isArray(opVal))) {
        return {
          error: '$elemMatch value must be an object { ... }'
        }
      }

      if (opName === '$slice') {
        const isNum = typeof opVal === 'number'
        const isPair = Array.isArray(opVal) && opVal.length === 2 && typeof opVal[0] === 'number' && typeof opVal[1] === 'number'

        if (!isNum && !isPair) {
          return {
            error: '$slice value must be a number or an array of two numbers [skip, limit]'
          }
        }
      }

      hasInclusion = true
    } else {
      return {
        error: `Invalid projection value type for "${key}"`
      }
    }
  }

  if (hasInclusion && hasExclusion) {
    return {
      error: 'Cannot mix inclusion and exclusion in projection'
    }
  }

  return {}
}
