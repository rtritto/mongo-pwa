import parseRelaxedJSON from './parseRelaxedJSON'

import { isPlainObject } from './common'
import isValidQuery from './isValidQuery'

const AGGREGATION_STAGES: ReadonlySet<string> = new Set([
  // Common
  '$match', '$group', '$sort', '$project',
  '$limit', '$skip', '$count', '$unwind',
  '$lookup', '$sample',

  // Transformation
  '$addFields', '$set', '$unset',
  '$replaceRoot', '$replaceWith', '$redact',

  // Advanced grouping
  '$bucket', '$bucketAuto', '$sortByCount', '$facet',

  // Join and graphs
  '$graphLookup', '$unionWith',

  // Output
  '$merge', '$out',

  // Window & analytics
  '$setWindowFields', '$densify', '$fill',

  // Stats & system
  '$collStats', '$indexStats', '$planCacheStats', '$currentOp',
  '$listSessions', '$listLocalSessions', '$changeStream',

  // Search (Atlas)
  '$search', '$searchMeta',

  // Documents
  '$documents'
])

export type ReturnValidation = { error?: string }

/**
 * Validates a string as a MongoDB aggregation pipeline.
 */
export function isValidAggregation(str: string): ReturnValidation {
  if (!str?.trim()) {
    return { error: 'Empty' }
  }

  let pipeline: unknown

  try {
    pipeline = parseRelaxedJSON(str)
  } catch (error) {
    return {
      error: `Invalid syntax: ${(error as Error).message}`
    }
  }

  if (!Array.isArray(pipeline)) {
    return {
      error: 'Must be an array of stages'
    }
  }

  // Empty pipeline is valid
  if (pipeline.length === 0) {
    return {}
  }

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < pipeline.length; i++) {
    const stage = pipeline[i]

    if (!isPlainObject(stage)) {
      return {
        error: `Stage at index ${i} must be an object`
      }
    }

    const keys = Object.keys(stage)

    if (keys.length !== 1) {
      return {
        error: `Stage at index ${i} must have exactly one key (the operator)`
      }
    }

    const stageOp = keys[0]

    // 36 is the character '$' (faster than startsWith)
    if (stageOp.codePointAt(0) !== 36) {
      return {
        error: `Invalid operator "${stageOp}" at index ${i}. Must start with $`
      }
    }

    if (!AGGREGATION_STAGES.has(stageOp)) {
      return {
        error: `Unknown stage operator: "${stageOp}" at index ${i}`
      }
    }

    const stageValue = stage[stageOp] as any

    // Operator-specific validations
    switch (stageOp) {
      case '$limit':
      case '$skip': {
        if (typeof stageValue !== 'number' || stageValue < 0 || !Number.isInteger(stageValue)) {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be a positive integer.`
          }
        }
        break
      }

      case '$count': {
        if (typeof stageValue !== 'string' || !stageValue.trim()) {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be a non-empty string.`
          }
        }
        break
      }

      case '$sort': {
        if (!isPlainObject(stageValue)) {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be an object.`
          }
        }

        for (const [sortField, val] of Object.entries(stageValue)) {
          if (
            val !== 1 && val !== -1 &&
            (!isPlainObject(val) || (val as any).$meta !== 'textScore')
          ) {
            return {
              error: `Invalid sort value for field "${sortField}" in ${stageOp} at index ${i}. Must be 1, -1, or { $meta: "textScore" }.`
            }
          }
        }
        break
      }

      case '$match': {
        if (!isPlainObject(stageValue)) {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be an object.`
          }
        }
        // Re-stringify the object to pass it to the query validation
        const { error } = isValidQuery(JSON.stringify(stageValue))
        if (error) {
          // Propagate the specific error raised by isValidQuery!
          return {
            error: `Invalid ${stageOp} at index ${i}: ${error}`
          }
        }
        break
      }

      case '$unwind': {
        if (typeof stageValue === 'string') {
          if (!stageValue.startsWith('$')) {
            return {
              error: `Invalid string value for ${stageOp} at index ${i}. Must start with $.`
            }
          }
        } else if (isPlainObject(stageValue)) {
          if (typeof stageValue.path !== 'string' || !stageValue.path.startsWith('$')) {
            return {
              error: `Invalid path in ${stageOp} at index ${i}. Must be a string starting with $.`
            }
          }
        } else {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be a string or an object with a path.`
          }
        }
        break
      }

      case '$unset': {
        if (typeof stageValue === 'string') {
          if (!stageValue.trim()) {
            return {
              error: `Invalid value for ${stageOp} at index ${i}. String cannot be empty.`
            }
          }
        } else if (Array.isArray(stageValue)) {
          if (!stageValue.every((v) => typeof v === 'string')) {
            return {
              error: `Invalid array for ${stageOp} at index ${i}. All elements must be strings.`
            }
          }
        } else {
          return {
            error: `Invalid value for ${stageOp} at index ${i}. Must be a string or an array of strings.`
          }
        }
        break
      }

      default: {
        if (stageValue === null || stageValue === undefined) {
          return {
            error: `Value for ${stageOp} at index ${i} cannot be null or undefined.`
          }
        }
      }
    }
  }

  return {}
}
