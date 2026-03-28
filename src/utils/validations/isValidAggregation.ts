import toBSON from '@/utils/mongodb-query-parser'
import { isPlainObject } from './common'
import isValidQuery from './isValidQuery'

// Allowed stages in the aggregation pipeline
const AGGREGATION_STAGES = new Set([
  // Common
  '$match', '$group', '$sort', '$project',
  '$limit', '$skip', '$count', '$unwind',
  '$lookup', '$sample',

  // Transformation
  '$addFields', '$set',
  '$unset',
  '$replaceRoot', '$replaceWith',
  '$redact',

  // Advanced grouping
  '$bucket', '$bucketAuto', '$sortByCount',
  '$facet',

  // Join and graphs
  '$graphLookup', '$unionWith',

  // Output
  '$merge', '$out',

  // Window & analytics
  '$setWindowFields', '$densify', '$fill',

  // Stats & system
  '$collStats', '$indexStats',
  '$planCacheStats', '$currentOp',
  '$listSessions', '$listLocalSessions',
  '$changeStream',

  // Search (Atlas)
  '$search', '$searchMeta',

  // Documents
  '$documents'
])

/**
 * Validates a string as a MongoDB aggregation pipeline.
 *
 * ✅ []
 * ✅ [{ "$match": { "status": "A" } }]
 * ✅ [{ "$group": { "_id": "$city" } }, { "$sort": { "_id": 1 } }]
 * ❌ {}
 * ❌ [{ "notAStage": 1 }]
 * ❌ [{ "$match": {}, "$sort": {} }]  — more than one key in a stage
 * ❌ [{ "$fake": {} }]
 */
export function isValidAggregation(str: string): ReturnValidation {
  let pipeline: unknown

  try {
    pipeline = toBSON(str)
  } catch {
    return {
      error: 'Aggregation pipeline has invalid JSON'
    }
  }

  // Must be an array
  if (!Array.isArray(pipeline)) {
    return {
      error: 'Aggregation pipeline must be an array of stages'
    }
  }

  // Empty pipeline is valid
  if (pipeline.length === 0) {
    return {}
  }

  for (const stage of pipeline) {
    // Each stage must be an object
    if (!isPlainObject(stage)) {
      return {
        error: 'Each stage in the aggregation pipeline must be an object'
      }
    }

    const keys = Object.keys(stage)

    // Each stage must have exactly 1 key (the operator)
    // Exception: $unset can accept a string or an array as the direct value
    if (keys.length !== 1) {
      return {
        error: 'Each stage in the aggregation pipeline must have exactly one key (the operator)'
      }
    }

    const stageOp = keys[0]

    // The key must start with $
    if (!stageOp.startsWith('$')) {
      return {
        error: `Invalid stage operator: ${stageOp}. Stage operators must start with $`
      }
    }

    // Must be a known stage
    if (!AGGREGATION_STAGES.has(stageOp)) {
      return {
        error: `Unknown stage operator: ${stageOp}`
      }
    }

    // Stage-specific validations
    const stageValue = stage[stageOp]

    switch (stageOp) {
      case '$limit':
      case '$skip': {
        // Must be positive integers
        if (typeof stageValue !== 'number' || stageValue < 0 || !Number.isInteger(stageValue)) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a positive integer`
          }
        }
      }
      case '$count': {
        // Must be a non-empty string
        if (typeof stageValue !== 'string' || stageValue.length === 0) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a non-empty string`
          }
        }
      }
      case '$sort': {
        // Must be an object with values 1, -1, or { $meta: "textScore" }
        if (!isPlainObject(stageValue)) return {
          error: `Invalid value for ${stageOp}: ${stageValue}. Must be an object`
        }
        for (const val of Object.values(stageValue)) {
          if (
            val !== 1 && val !== -1
            && (!isPlainObject(val) || (val as Record<string, unknown>).$meta !== 'textScore')
          ) {
            return {
              error: `Invalid value for ${stageOp}: ${stageValue}. Must be 1, -1, or { $meta: "textScore" }`
            }
          }
        }
      }

      case '$match': {
        // The content must be a valid query
        if (!isPlainObject(stageValue)) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be an object`
          }
        }
        if (isValidQuery(JSON.stringify(stageValue)).error) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a valid query`
          }
        }
      }

      case '$unwind': {
        // String (path) or object with "path"
        if (typeof stageValue === 'string') {
          if (!stageValue.startsWith('$')) {
            return {
              error: `Invalid value for ${stageOp}: ${stageValue}. Must start with $`
            }
          }
        } else if (isPlainObject(stageValue)) {
          if (typeof stageValue.path !== 'string' || !stageValue.path.startsWith('$')) {
            return {
              error: `Invalid value for ${stageOp}: ${stageValue}. Path must be a string starting with $`
            }
          }
        } else {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a string or an object with a path`
          }
        }
      }

      case '$unset': {
        // String or array of strings
        if (typeof stageValue !== 'string' && !Array.isArray(stageValue)) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a string or an array of strings`
          }
        }
        if (Array.isArray(stageValue) && !stageValue.every((v) => typeof v === 'string')) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. All elements must be strings`
          }
        }
      }

      default: {
        // For all other stages: the value must be an object or a valid type
        // We do not validate in detail — MongoDB will perform the final validation
        if (stageValue === null || stageValue === undefined) {
          return {
            error: `Invalid value for ${stageOp}: ${stageValue}. Must be a valid value`
          }
        }
      }
    }
  }

  return {}
}
