import { Binary, ObjectId } from 'bson'

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
  const rounded = i === 0 ? value : value.toFixed(2)
  return `${rounded} ${SIZE_UNITS[i] ?? 'Bytes'}`
}

/**
 * Converts a byte count into the next most appropriate size unit,
 * using explicit thresholds and rounding to 2 decimals.
 */
export const convertBytes = (bytes?: number): string => {
  if (bytes === undefined || bytes < 0) return '0 Bytes'

  let unitIndex = 0
  let value = bytes

  while (value >= BASE && unitIndex < SIZE_UNITS.length - 1) {
    value /= BASE
    unitIndex++
  }

  const formatted = unitIndex === 0 ? value.toString() : value.toFixed(2)
  return `${formatted} ${SIZE_UNITS[unitIndex]}`
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

export const buildId = (_id: string | number, sub_type: number | undefined) => {
  // Case 1 : ObjectId
  try {
    return ObjectId.createFromHexString(_id as string)
  } catch {
    // Case 2 : BinaryID (only subtype 4)
    if (sub_type === Binary.SUBTYPE_UUID) {
      return new Binary(Buffer.from((_id as string).replaceAll('-', ''), 'hex'), sub_type)
    }
    // Case 3 : Try as raw ID (e.g. number)
    return Number(_id)
  }
}
