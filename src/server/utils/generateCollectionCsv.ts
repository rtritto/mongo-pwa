import type { AbstractCursor, Document } from 'mongodb'

const encoder = new TextEncoder()

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && value.constructor?.name === 'Object'
}

/**
 * Converts BSON/JS values into a stable, human readable representation
 * before flattening (replaces the old ObjectId-only `handleObject` walk).
 */
function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(normalizeValue)
  if (value instanceof Date) return value.toISOString()

  const ctorName = (value as { constructor?: { name?: string } }).constructor?.name
  if (ctorName === 'ObjectId') return `ObjectId("${String(value)}")`
  if (ctorName === 'Binary' && typeof (value as { toString: (encoding: string) => string }).toString === 'function')
    return (value as { toString: (encoding: string) => string }).toString('base64')
  if (isPlainObject(value)) {
    const normalized: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) normalized[key] = normalizeValue(v)
    return normalized
  }
  return value
}

/**
 * Native replacement for the `flat` package (used previously with `{ safe: true }`):
 * flattens nested plain objects into dot-notation keys, leaves arrays as leaf values.
 */
function flatten(value: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
  if (isPlainObject(value) && Object.keys(value).length > 0)
    for (const [key, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${key}` : key, result)
  else
    result[prefix] = value
  return result
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',')
}

/**
 * Streams a MongoDB cursor as CSV without loading the whole collection in memory.
 *
 * Documents in a collection can have different shapes, so a single streaming
 * pass can't safely determine the CSV header up front. A cheap first pass over
 * a *cloned* cursor collects the full set of flattened field names to build a
 * consistent header, then a second pass streams the actual rows one document
 * at a time. This costs one extra scan of the collection but keeps memory
 * usage constant regardless of collection size — unlike buffering every
 * document to compute headers, or loading everything into an array to run a
 * CSV parser.
 */
export async function* generateCollectionCsv(cursor: AbstractCursor<Document>): AsyncGenerator<Uint8Array> {
  const fields = new Set<string>()
  const headerCursor = cursor.clone()
  try {
    for await (const doc of headerCursor) {
      const flat = flatten(normalizeValue(doc))
      for (const key of Object.keys(flat)) fields.add(key)
    }
  } finally {
    await headerCursor.close()
  }

  const fieldList = [...fields]
  yield encoder.encode(`${toCsvRow(fieldList)}\n`)

  try {
    for await (const doc of cursor) {
      const flat = flatten(normalizeValue(doc))
      yield encoder.encode(`${toCsvRow(fieldList.map(field => flat[field]))}\n`)
    }
  } finally {
    await cursor.close()
  }
}
