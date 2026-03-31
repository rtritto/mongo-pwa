import type { Binary, Code, DBRef, Decimal128, Double, Int32, Long, ObjectId, Timestamp } from 'bson'

type BSONValues = Binary | Code | DBRef | Date | Decimal128 | Double | Int32 | Long | ObjectId | Timestamp

const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const
const BASE = 1024

/**
 * Converts a byte count into a human-readable size string.
 * e.g. 1536 → "1.50 KB"
 */
export const bytesToSize = (bytes?: number): string => {
  if (!bytes || bytes < 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(BASE))
  const value = bytes / BASE ** i
  const formatted = i === 0 ? value.toString() : value.toFixed(2)
  return `${formatted.replace(/\.00$/, '')} ${SIZE_UNITS[i]}`
}

const deepmergeArray = (target: object[], src: object[]) => {
  const dst = [...(target || [])]
  for (const [i, e] of src.entries()) {
    if (dst[i] === undefined) {
      dst[i] = e
    } else if (typeof e === 'object') {
      dst[i] = deepmerge(target[i], e)
    } else if (!target.includes(e)) {
      dst.push(e)
    }
  }
  return dst
}

interface IObject {
  [key: string]: any
}

const deepmergeObject = (target: IObject, src: IObject) => {
  const dst: IObject = {}
  if (target && typeof target === 'object') {
    for (const key of Object.keys(target)) {
      dst[key as keyof IObject] = target[key]
    }
  }
  for (const key of Object.keys(src)) {
    if (typeof src[key] !== 'object' || !src[key]) {
      dst[key] = src[key]
    } else if (target[key]) {
      dst[key] = deepmerge(target[key], src[key])
    } else {
      dst[key] = src[key]
    }
  }
  return dst
}

export const deepmerge = (target: object[] | object, src: object[] | object) => {
  if (Array.isArray(src)) {
    return deepmergeArray(target as object[], src as object[])
  }

  return deepmergeObject(target as object, src as object)
}

/**
 * Convert BSON into a plain string:
 * - { _bsontype: 'ObjectId', id: <Buffer> } => <ObjectId>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: 4, position: 16, buffer: <Buffer> } => <UUID>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: <number_not_4>, position: 16, buffer: <Buffer> } => <Binary>
 */
export const docToString = function (input: BSONValues): string | number | boolean | null | undefined | object {
  if (input == null) return input

  // Array → recursive
  if (Array.isArray(input)) {
    return input.map((i) => docToString(i))
  }

  /**
   * See similar toString in BSON_TO_JS_STRING in src/utils/mongodb-query-parser/stringify.ts for the reverse operation (string to BSON)
   * @link https://github.com/mongodb-js/devtools-shared/blob/main/packages/query-parser/src/stringify.ts
   */
  // Object with specific constructor (BSON types, Date, etc.)
  if (typeof input === 'object') {
    switch (input.constructor.name) {
      case 'Object': {
        // Plain object → recursive on each key
        return Object.fromEntries(
          Object.entries(input).map(([key, value]) => [key, docToString(value)])
        )
      }
      case 'Date': {
        return (input as Date).toISOString()
      }
      case 'Code': {
        return `${(input as Code).code}${(input as Code).scope ? `,${JSON.stringify((input as Code).scope)}` : ''}`
      }
      case 'DBRef': {
        return `${(input as DBRef).collection},${(input as DBRef).oid.toString()}${(input as DBRef).db ? `,${(input as DBRef).db}` : ''}`
      }
      case 'MaxKey':
      case 'MinKey': {
        return input.constructor.name
      }
      default: {
        // ObjectId, UUID, Decimal128, Long, Int32, Double, etc.
        return input.toString()
      }
    }
  }

  // Primitive types (string, number, boolean)
  return input
}
