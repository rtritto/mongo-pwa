import { EJSON } from 'bson'
import type { AbstractCursor, Document } from 'mongodb'

const encoder = new TextEncoder()

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object
}

/**
 * EJSON wraps every non-JSON-native BSON type in a single-key `$xxx` object
 * (ObjectId -> {$oid}, Date -> {$date}, Timestamp -> {$timestamp:{t,i}},
 * Binary -> {$binary:{...}}, MinKey/MaxKey -> {$minKey|$maxKey:1}, ...).
 * These must be treated as opaque leaves and kept fully tagged — unwrapping
 * them to a "nicer" bare value is lossy and unrecoverable on import (e.g.
 * MinKey/MaxKey both collapse to the literal number 1, indistinguishable
 * from a real field holding 1; Binary/Timestamp have no bare form at all).
 */
function isEjsonExtendedType(value: unknown): value is Record<string, unknown> {
  if (!isPlainObject(value)) return false
  const keys = Object.keys(value)
  return keys.length === 1 && keys[0].startsWith('$')
}

/**
 * Native replacement for the `flat` package: flattens nested plain objects
 * into dot-notation keys. EJSON extended-type wrappers are treated as leaves
 * (fully tagged) rather than descended into, so they survive re-parsing.
 */
function flatten(value: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
  if (isPlainObject(value) && !isEjsonExtendedType(value) && Object.keys(value).length > 0)
    for (const [key, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${key}` : key, result)
  else result[prefix] = value
  return result
}

function csvEscape(value: unknown): string {
  if (value === undefined) return ''
  // Explicitly quote empty strings so they're distinguishable on import from
  // a genuinely absent field (which stays an empty, unquoted cell).
  if (value === '') return '""'
  if (value === null) return 'null'
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
