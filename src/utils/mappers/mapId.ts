import { type ObjectId, Binary, Long } from 'mongodb'

const addHyphensToUUID = (hex: string) => {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

const uuid4ToString = (input: Binary) => {
  const hex = input.toString('hex') // same of input.buffer.toString('hex')
  return addHyphensToUUID(hex)
}


/**
 * Convert BSON into a plain string:
 * - { _bsontype: 'ObjectId', id: <Buffer> } => <ObjectId>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: 4, position: 16, buffer: <Buffer> } => <UUID>
 * - { _bsontype: 'Binary', __id: undefined, sub_type: <number_not_4>, position: 16, buffer: <Buffer> } => <Binary>
 */
export const stringDocIDs = (input: ObjectId | Binary | Long): string => {
  if (input && typeof input === 'object') {
    switch (input._bsontype) {
      case 'ObjectId':
      case 'Long': {
        return input.toString()
      }
      case 'Binary': {
        if (input.sub_type === Binary.SUBTYPE_UUID) {
          return uuid4ToString(input)
        }
        return input.toJSON()
      }
      default: {
        return input
      }
    }
  }

  return input
}
