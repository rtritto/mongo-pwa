import { EJSON } from 'bson'
import type { AbstractCursor, Document } from 'mongodb'

const encoder = new TextEncoder()

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object
}

/**
 * EJSON wraps every non-JSON-native BSON type in a single-key `$xxx` object
 * (ObjectId -> { $oid }, Date -> { $date }, Decimal128 -> { $numberDecimal },
 * Binary -> { $binary: {...} }, ...). We want those rendered as a scalar CSV
 * cell rather than recursively flattened into e.g. `field.$oid` columns.
 */
function isEjsonExtendedType(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value)) return false
  const keys = Object.keys(value)
  return keys.length === 1 && keys[0].startsWith('$')
}

/**
 * Reduces an EJSON extended-type wrapper down to a plain, human-readable
 * scalar (e.g. { $oid: '664f...' } -> '664f...').
 */
function ejsonToPrimitive(value: Record<string, unknown>): unknown {
  const [key] = Object.keys(value)
  const inner = value[key]
  return inner === null || typeof inner !== 'object' ? inner : EJSON.stringify(inner)
}

/** Recursively strips EJSON extended-type wrappers, e.g. inside arrays. */
function unwrapEjsonDeep(value: unknown): unknown {
  if (isEjsonExtendedType(value)) return ejsonToPrimitive(value)
  if (Array.isArray(value)) return value.map(v => unwrapEjsonDeep(v))
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = unwrapEjsonDeep(v)
    return out
  }
  return value
}

/**
 * Native replacement for the `flat` package (used previously with `{ safe: true }`):
 * flattens nested plain objects into dot-notation keys. Values are expected to
 * already be EJSON-serialized; extended-type wrappers are unwrapped to plain
 * scalars and treated as leaves rather than descended into as regular objects.
 */
function flatten(value: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
  if (isEjsonExtendedType(value)) result[prefix] = ejsonToPrimitive(value)
  else if (Array.isArray(value)) result[prefix] = unwrapEjsonDeep(value)
  else if (isPlainObject(value) && Object.keys(value).length > 0)
    for (const [key, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${key}` : key, result)
  else result[prefix] = value
  return result
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /[",\n\r]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str
}

function toCsvRow(values: unknown[]): string {
  return values.map(value => csvEscape(value)).join(',')
}

/**
 * Streams a MongoDB cursor as CSV without loading the whole collection in memory.
 *
 * Documents can have different shapes, so a single streaming pass can't safely
 * determine the CSV header up front. A cheap first pass over a *cloned* cursor
 * collects the full set of flattened field names to build a consistent header,
 * then a second pass streams the actual rows one document at a time.
 */
export async function* generateCollectionCsv(cursor: AbstractCursor<Document>): AsyncGenerator<Uint8Array> {
  const fields = new Set<string>()
  const headerCursor = cursor.clone()
  try {
    for await (const doc of headerCursor) {
      const flat = flatten(EJSON.serialize(doc, { relaxed: true }))
      for (const key of Object.keys(flat)) fields.add(key)
    }
  } finally {
    await headerCursor.close()
  }

  const fieldList = [...fields]
  yield encoder.encode(`${toCsvRow(fieldList)}\n`)

  try {
    for await (const doc of cursor) {
      const flat = flatten(EJSON.serialize(doc, { relaxed: true }))
      yield encoder.encode(`${toCsvRow(fieldList.map(field => flat[field]))}\n`)
    }
  } finally {
    await cursor.close()
  }
}
