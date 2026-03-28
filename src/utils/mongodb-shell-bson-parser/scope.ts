/** @link https://github.com/mongodb-js/devtools-shared/blob/main/packages/shell-bson-parser/src/scope.ts */

import { Binary, BSONSymbol, Code, DBRef, Decimal128, Double, Int32, Long, MaxKey, MinKey, ObjectId, Timestamp, UUID } from 'bson'

// Returns the same object but frozen and with a null prototype.
function lookupMap<T extends object>(input: T): Readonly<T> {
  return Object.freeze(
    Object.create(null, Object.getOwnPropertyDescriptors(input))
  )
}

function NumberLong(v: any) {
  return typeof v === 'string' ? Long.fromString(v) : Long.fromNumber(v)
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const SCOPE_CALL: { [x: string]: Function } = lookupMap({
  Date: function (...args: any[]) {
    // casting our arguments as an empty array because we don't know
    // the length of our arguments, and should allow users to pass what
    // they want as date arguments
    // TODO remove SCOPE_CALL or fix?
    // eslint-disable-next-line unicorn/new-for-builtins
    return Date(...(args as []))
  }
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const SCOPE_NEW: { [x: string]: Function } = lookupMap({
  Date: function (...args: any[]) {
    // casting our arguments as an empty array because we don't know
    // the length of our arguments, and should allow users to pass what
    // they want as date arguments
    return new Date(...(args as []))
  }
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const SCOPE_ANY: { [x: string]: Function } = lookupMap({
  // Remove LegacyJavaUUID, LegacyCSharpUUID, LegacyPythonUUID
  // Legacy UUID functions from
  // https://github.com/mongodb/mongo-csharp-driver/blob/ac2b2a61c6b7a193cf0266dfb8c65f86c2bf7572/uuidhelpers.js
  RegExp: RegExp,
  Binary: function (buffer: any, subType: any) {
    return new Binary(buffer, subType)
  },
  BinData: function (t: any, d: any) {
    return new Binary(Buffer.from(d, 'base64'), t)
  },
  UUID: function (u: any) {
    if (u === undefined) {
      return new UUID().toBinary()
    }
    return new Binary(Buffer.from(u.replaceAll('-', ''), 'hex'), 4)
  },
  Code: function (c: any, s: any) {
    return new Code(c, s)
  },
  DBRef: function (namespace: any, oid: any, db: any, fields: any) {
    return new DBRef(namespace, oid, db, fields)
  },
  Decimal128: function (s: any) {
    return Decimal128.fromString(s)
  },
  NumberDecimal: function (s: any) {
    return Decimal128.fromString(s)
  },
  Double: function (s: any) {
    return new Double(s)
  },
  Int32: function (i: any) {
    return new Int32(i)
  },
  NumberInt: function (s: any) {
    return new Int32(s)
  },
  Long: function (low: any, high: any) {
    return new Long(low, high)
  },
  NumberLong,
  Int64: NumberLong,
  Map: function (arr: any) {
    return new Map(arr)
  },
  MaxKey: function () {
    return new MaxKey()
  },
  MinKey: function () {
    return new MinKey()
  },
  ObjectID: function (i: any) {
    return new ObjectId(i)
  },
  ObjectId: function (i: any) {
    return new ObjectId(i)
  },
  Symbol: function (i: any) {
    return new BSONSymbol(i)
  },
  Timestamp: function (low: any, high: any) {
    if (
      (typeof low === 'number' && typeof high === 'number') ||
      high !== undefined
    ) {
      // https://www.mongodb.com/docs/manual/reference/bson-types/#timestamps
      // reverse the order to match the legacy shell
      return new Timestamp({ t: low, i: high })
    }
    return new Timestamp(low)
  },
  ISODate: function (input?: string): Date {
    if (input === undefined) return new Date()
    if (typeof input !== 'string') return new Date(input)
    const isoDateRegex =
      /^(?<Y>\d{4})-?(?<M>\d{2})-?(?<D>\d{2})([T ](?<h>\d{2})(:?(?<m>\d{2})(:?((?<s>\d{2})(\.(?<ms>\d+))?))?)?(?<tz>Z|([+-])(\d{2}):?(\d{2})?)?)?$/
    const match = input.match(isoDateRegex)
    if (match !== null && match.groups !== undefined) {
      // Normalize the representation because ISO-8601 accepts e.g.
      // '20201002T102950Z' without : and -, but `new Date()` does not.
      const { Y, M, D, h, m, s, ms, tz } = match.groups
      const normalized = `${Y}-${M}-${D}T${h || '00'}:${m || '00'}:${s || '00'
        }.${ms || '000'}${tz || 'Z'}`
      const date = new Date(normalized)
      // Make sure we're in the range 0000-01-01T00:00:00.000Z - 9999-12-31T23:59:59.999Z
      if (
        date.getTime() >= -62167219200000 &&
        date.getTime() <= 253402300799999
      ) {
        return date
      }
    }
    throw new Error(`${JSON.stringify(input)} is not a valid ISODate`)
  }
})

export const GLOBALS: { [x: string]: any } = lookupMap({
  Infinity: Infinity,
  NaN: Number.NaN,
  undefined: undefined
})

type AllowedMethods = { [methodName: string]: boolean }

/**
 * Internal object of Member -> Allowed methods on that member.
 *
 * Allowed Methods is allowed to be a string, which just indirects to another member.
 * (Pretty much only for ISODate to save on some boilerplate)
 */
type ClassExpressions = {
  [member: string]: {
    class: typeof Math | typeof Date | typeof Binary
    allowedMethods: AllowedMethods | string
  }
}

const ALLOWED_CLASS_EXPRESSIONS: ClassExpressions = lookupMap({
  Math: lookupMap({
    class: Math,
    allowedMethods: lookupMap({
      abs: true,
      acos: true,
      acosh: true,
      asin: true,
      asinh: true,
      atan: true,
      atan2: true,
      atanh: true,
      cbrt: true,
      ceil: true,
      clz32: true,
      cos: true,
      cosh: true,
      exp: true,
      expm1: true,
      floor: true,
      fround: true,
      hypot: true,
      imul: true,
      log: true,
      log10: true,
      log1p: true,
      log2: true,
      max: true,
      min: true,
      pow: true,
      round: true,
      sign: true,
      sin: true,
      sinh: true,
      sqrt: true,
      tan: true,
      tanh: true,
      trunc: true
    })
  }),
  Date: lookupMap({
    class: Date,
    allowedMethods: lookupMap({
      getDate: true,
      getDay: true,
      getFullYear: true,
      getHours: true,
      getMilliseconds: true,
      getMinutes: true,
      getMonth: true,
      getSeconds: true,
      getTime: true,
      getTimezoneOffset: true,
      getUTCDate: true,
      getUTCDay: true,
      getUTCFullYear: true,
      getUTCHours: true,
      getUTCMilliseconds: true,
      getUTCMinutes: true,
      getUTCMonth: true,
      getUTCSeconds: true,
      getYear: true,
      now: true,
      setDate: true,
      setFullYear: true,
      setHours: true,
      setMilliseconds: true,
      setMinutes: true,
      setMonth: true,
      setSeconds: true,
      setTime: true,
      setUTCDate: true,
      setUTCFullYear: true,
      setUTCHours: true,
      setUTCMilliseconds: true,
      setUTCMinutes: true,
      setUTCMonth: true,
      setUTCSeconds: true,
      setYear: true,
      toISOString: true,
      valueOf: true
    })
  }),
  ISODate: lookupMap({
    class: Date,
    allowedMethods: 'Date'
  }),
  Binary: lookupMap({
    class: Binary,
    allowedMethods: {
      createFromHexString: true,
      createFromBase64: true
    }
  })
})

export const GLOBAL_FUNCTIONS = Object.freeze([
  ...Object.keys(SCOPE_ANY),
  ...Object.keys(SCOPE_NEW),
  ...Object.keys(SCOPE_CALL)
])

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getScopeFunction(key: string, withNew: boolean): Function {
  if (withNew && SCOPE_NEW[key]) {
    return SCOPE_NEW[key]
  } else if (!withNew && SCOPE_CALL[key]) {
    return SCOPE_CALL[key]
  } else if (SCOPE_ANY[key]) {
    return SCOPE_ANY[key]
  }

  throw new Error(`Attempted to access scope property '${key}' that doesn't exist`)
}

export function isMethodWhitelisted(member: string, property: string): boolean {
  if (Object.prototype.hasOwnProperty.call(ALLOWED_CLASS_EXPRESSIONS, member)) {
    const allowedMethods = ALLOWED_CLASS_EXPRESSIONS[member].allowedMethods

    if (typeof allowedMethods === 'string') {
      return (
        ALLOWED_CLASS_EXPRESSIONS[allowedMethods]
          .allowedMethods as AllowedMethods
      )[property]
    }
    return allowedMethods[property]
  }

  return false
}

export function getClass(member: string) {
  if (Object.prototype.hasOwnProperty.call(ALLOWED_CLASS_EXPRESSIONS, member)) {
    return ALLOWED_CLASS_EXPRESSIONS[member].class
  }
  throw new Error(`Attempted to access member '${member}' that doesn't exist`)
}
