import { EJSON, type Document } from 'bson'
import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/json'
])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && value.constructor === Object
}

interface CsvCell {
  value: string
  /** Whether the field was wrapped in quotes in the source CSV — used to tell
   *  an explicit empty string ("") apart from a genuinely absent field. */
  quoted: boolean
}

/**
 * RFC4180-ish CSV parser: handles quoted fields containing commas, embedded
 * newlines and escaped ("") quotes, and tracks per-field quoting so callers
 * can distinguish an explicit empty string from an absent value.
 */
function parseCsv(text: string): CsvCell[][] {
  const rows: CsvCell[][] = []
  let row: CsvCell[] = []
  let field = ''
  let inQuotes = false
  let wasQuoted = false

  const pushField = () => {
    row.push({ value: field, quoted: wasQuoted })
    field = ''
    wasQuoted = false
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    switch (char) {
      case '"': {
        inQuotes = true
        wasQuoted = true
        break
      }
      case ',': {
        pushField()
        break
      }
      case '\r': {
        continue
      }
      case '\n': {
        pushField()
        rows.push(row)
        row = []
        break
      }
      default: {
        field += char
      }
    }
  }

  if (wasQuoted || field.length > 0 || row.length > 0) {
    pushField()
    rows.push(row)
  }

  // Drop a trailing blank row caused by a final newline in the file
  const last = rows.at(-1)
  if (last && last.length === 1 && last[0].value === '' && !last[0].quoted) rows.pop()

  return rows
}

/**
 * Recovers a scalar/structural value from a CSV cell. Values exported by
 * `generateCollectionCsv` always carry their BSON type as an EJSON tag
 * (e.g. {"$oid":"..."}), so `EJSON.parse` alone is enough to reconstruct the
 * correct BSON type — no fragile heuristics (looks-like-an-ObjectId,
 * looks-like-a-date) are needed, and none are used, since those would wrongly
 * promote genuine string fields that merely resemble a hex id or a date.
 */
function castCsvValue(cell: CsvCell): unknown {
  const { value: raw, quoted } = cell
  if (raw === '') return quoted ? '' : undefined
  if (raw === 'null') return null
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      return EJSON.parse(raw)
    } catch {
      // Not valid (E)JSON after all, fall through and keep it as a string
    }
  }
  return raw
}

// Reverses the dot-notation flattening done at export time.
function unflattenRow(header: string[], cells: CsvCell[]): Record<string, unknown> {
  const doc: Record<string, unknown> = {}
  for (const index in header) {

    const value = castCsvValue(cells[index] ?? { value: '', quoted: false })
    if (value === undefined) continue

    const parts = header[index].split('.')
    let node = doc
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!isPlainObject(node[part])) node[part] = {}
      node = node[part] as Record<string, unknown>
    }
    node[parts.at(-1) as string] = value
  }
  return doc
}

function parseJsonFile(fileContent: string): Document[] {
  const lines = fileContent.split('\n').map(line => line.trim()).filter(Boolean)
  const docs: Document[] = []
  for (const line of lines) {
    const parsedData = EJSON.parse(line)
    // Use for loop instead of spread to avoid stack overflow with large arrays
    for (const doc of parsedData) docs.push(doc)
  }
  return docs
}

function parseCsvFile(fileContent: string): Document[] {
  const rows = parseCsv(fileContent)
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  const headerNames = header.map(cell => cell.value)
  return dataRows.map(cells => unflattenRow(headerNames, cells))
}

export default async function collectionImport({ file, collection, database }: {
  file: File
  collection: string
  database: string
}) {
  if (!file) throw new HTTPException(400, { message: 'No file' })
  if (!ALLOWED_MIME_TYPES.has(file.type) || !(file instanceof File) || file.size === 0) throw new HTTPException(400, { message: 'Bad file' })

  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  let docs: Document[]
  try {
    const fileContent = await file.text()
    docs = file.type === 'text/csv' ? parseCsvFile(fileContent) : parseJsonFile(fileContent)
  } catch (error) {
    console.error(error)
    throw new HTTPException(400, { message: 'Bad file content' })
  }

  if (docs.length === 0) throw new HTTPException(400, { message: 'No documents found in file' })

  const { insertedCount } = await globalThis.mongo.mongoClient.db(database).collection(collection).insertMany(docs)
  return { insertedCount }
}
