import { Binary, ObjectId } from 'bson'

const K = 1000
const LOG = Math.log(K)
const BYTES_MAP = {
  Bytes: 1024,
  KB: 1024 * 1024,
  MB: 1024 * 1024 * 1024,
  GB: 1024 * 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024 * 1024,
  PB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  EB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  ZB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  YB: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
} as const
const SIZES = Object.keys(BYTES_MAP)

// Given some size in bytes, returns it in a converted, friendly size
// credits: http://stackoverflow.com/users/1596799/aliceljm
export const bytesToSize = (bytes: number) => {
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / LOG)
  return `${(bytes / (K ** i)).toPrecision(3)} ${SIZES[i]}`
}

export const convertBytes = (input: number | undefined) => {
  if (input === undefined) {
    return '0 Byte'
  }
  if (input < BYTES_MAP.Bytes) {
    return `${input} Bytes`
  }
  if (input < BYTES_MAP.KB) {
    // Convert to KB and keep 2 decimal values
    return `${Math.round((input / BYTES_MAP.Bytes) * 100) / 100} KB`
  }
  if (input < BYTES_MAP.MB) {
    return `${Math.round((input / BYTES_MAP.KB) * 100) / 100} MB`
  }
  if (input < BYTES_MAP.GB) {
    return `${Math.round((input / BYTES_MAP.MB) * 100) / 100} GB`
  }
  if (input < BYTES_MAP.TB) {
    return `${Math.round((input / BYTES_MAP.GB) * 100) / 100} TB`
  }
  if (input < BYTES_MAP.PB) {
    return `${Math.round((input / BYTES_MAP.TB) * 100) / 100} PB`
  }
  if (input < BYTES_MAP.EB) {
    return `${Math.round((input / BYTES_MAP.PB) * 100) / 100} EB`
  }
  if (input < BYTES_MAP.ZB) {
    return `${Math.round((input / BYTES_MAP.EB) * 100) / 100} ZB`
  }
  if (input < BYTES_MAP.YB) {
    return `${Math.round((input / BYTES_MAP.ZB) * 100) / 100} YB`
  }
  return `${input} Bytes`
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

type ObjectInputSize = {
  [key: string]: PrimitiveTypes
}

const recurse = (value: PrimitiveTypes | ObjectInputSize, objectList: object[]): number => {
  let bytes = 0

  if (typeof value === 'boolean') {
    bytes = 4
  } else if (typeof value === 'string') {
    bytes = value.length * 2
  } else if (typeof value === 'number') {
    bytes = 8
  } else if (typeof value === 'object' && !objectList.includes(value)) {
    objectList[objectList.length] = value

    for (const i in value) {
      bytes += 8 // an assumed existence overhead
      bytes += recurse(value[i], objectList)
    }
  }

  return bytes
}

export const roughSizeOfObject = (value: PrimitiveTypes | ObjectInputSize) => {
  const objectList: object[] = []

  return recurse(value, objectList)
}

export const addHyphensToUUID = (hex: string) => {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

export const buildId = (_id: string | number, _subtype: number | undefined) => {
  // Case 1 : ObjectId
  if (ObjectId.isValid(_id)) {
    return new ObjectId(_id as string)
  }
  // Case 2 : BinaryID (only subtype 4)
  if (_subtype === Binary.SUBTYPE_UUID) {
    return new Binary(Buffer.from((_id as string).replaceAll('-', ''), 'hex'), _subtype)
  }
  // Case 3 : Try as raw ID (e.g. number)
  return _id as number
}
