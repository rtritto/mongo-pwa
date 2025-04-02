import { BSON, ObjectId } from 'mongodb'
import parser, { toJSString } from 'mongodb-query-parser'

export const toBSON = parser

const { EJSON } = BSON

// This function as the name suggests attempts to parse
// the free form string in to BSON, since the possibilities of failure
// are higher, this function uses a try..catch
export const toSafeBSON = (string: string) => {
  try {
    return toBSON(string)
  } catch (error) {
    console.error(error)
    return
  }
}

export const parseObjectId = (string: string) => {
  if (/^[\da-f]{24}$/i.test(string)) {
    return new ObjectId(string)
  }
  return toBSON(string)
}

// Convert BSON documents to string
export const toString = (doc: BSON.Document) => {
  return toJSString(doc, '  ')
}

export const toJsonString = (doc: BSON.Document) => {
  return EJSON.stringify(EJSON.serialize(doc))
}
