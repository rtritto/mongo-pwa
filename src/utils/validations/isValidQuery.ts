import toBSON from 'mongodb-query-parser-esm'

// Note: ([:\[,]\s*) ensures to match only when used as a "value"
// and not as part of the text inside a normal string.

// Single combined regex for all function-style types
const MONGO_FN_RE = /([:\[,]\s*)(ISODate|ObjectId|NumberLong|NumberInt|NumberDecimal)\(\s*(['"]?)([^'"\)\s]*)\3\s*\)/g

// RegExp literal
const REGEXP_LITERAL_RE = /([:\[,]\s*)\/([^/]+)\/([gimsuy]*)/g

// Strip strings before checking for unknown functions
const STRING_LITERAL_RE = /(["'])(?:(?!\1)[^\\]|\\.)*\1/g

// Detect unknown functions (after stripping)
const UNKNOWN_FN_RE = /:\s*([a-zA-Z_]\w*)\s*\(/

// Valid operators (immutable via TS)
const VALID_OPERATORS: ReadonlySet<string> = new Set([
  '$gt', '$gte', '$lt', '$lte', '$eq', '$ne',
  '$in', '$nin', '$exists', '$type',
  '$regex', '$options',
  '$and', '$or', '$not', '$nor',
  '$elemMatch', '$size', '$all',
  '$expr', '$mod', '$text', '$search',
  '$geoWithin', '$geoIntersects', '$near', '$nearSphere'
])

// Type validators
const TYPE_VALIDATORS = new Map<string, (value: string) => void>([
  ['ISODate', (v) => {
    if (Number.isNaN(Date.parse(v))) throw new Error(`Invalid ISODate: "${v}"`)
  }],
  ['ObjectId', (v) => {
    if (!/^[a-fA-F0-9]{24}$/.test(v)) throw new Error(`Invalid ObjectId: "${v}"`)
  }],
  ['NumberLong', (v) => {
    if (!/^-?\d+$/.test(v)) throw new Error(`Invalid NumberLong: "${v}"`)
  }],
  ['NumberInt', (v) => {
    if (!/^-?\d+$/.test(v)) throw new Error(`Invalid NumberInt: "${v}"`)
  }],
  ['NumberDecimal', (v) => {
    if (Number.isNaN(Number(v))) throw new Error(`Invalid NumberDecimal: "${v}"`)
  }]
])

function sanitize(str: string): string {
  // All function-style types in one go
  let sanitized = str.replaceAll(
    MONGO_FN_RE,
    (_match, prefix: string, type: string, _quote: string, value: string) => {
      TYPE_VALIDATORS.get(type)?.(value)  // validate (or throw)
      return `${prefix}"$$${type}:${value}"`    // Re-inserts the prefix ( : [ , )
    }
  )

  // RegExp literals
  sanitized = sanitized.replaceAll(
    REGEXP_LITERAL_RE,
    (_match, prefix: string, pattern: string, flags: string) => {
      try { new RegExp(pattern, flags) }
      catch { throw new Error(`Invalid RegExp: /${pattern}/${flags}`) }
      return `${prefix}"$$RegExp:${pattern}:${flags}"`
    }
  )

  // Strip strings before checking for unknown functions
  // { a: { $regex: "foo(" } } → { a: { $regex: "" } } → no false positives
  const stripped = sanitized.replaceAll(STRING_LITERAL_RE, '""')
  const unknownFn = stripped.match(UNKNOWN_FN_RE)
  if (unknownFn) {
    throw new Error(`Unrecognized type: "${unknownFn[1]}"`)
  }

  return sanitized
}

// Operator validation: iterative (no stack overflow)
function validateOperators(root: Record<string, unknown>): void {
  const stack: { obj: Record<string, unknown>; path: string }[] = [
    { obj: root, path: '' }
  ]

  while (stack.length > 0) {
    const { obj, path } = stack.pop()!
    const keys = Object.keys(obj)

    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      // 36 is the character '$'
      if (key.codePointAt(0) === 36 && !VALID_OPERATORS.has(key)) {
        throw new Error(`Invalid operator: "${key}" in ${path || 'root'}`)
      }

      const val = obj[key]
      if (val !== null && typeof val === 'object') {
        stack.push({
          obj: val as Record<string, unknown>,
          path: path ? `${path}.${key}` : key
        })
      }
    }
  }
}

export function validateQuery(str: string): { error?: string } {
  if (!str?.trim()) {
    return {
      error: 'Empty'
    }
  }
  try {
    const sanitized = sanitize(str.trim())
    const parsed = toBSON(sanitized)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        error: 'Not an object'
      }
    }

    validateOperators(parsed as Record<string, unknown>)

    return {}
  } catch (error) {
    return {
      error: (error as Error).message
    }
  }
}

export default validateQuery
