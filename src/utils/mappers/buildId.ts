import { Binary, ObjectId } from 'bson-esm'

export default function buildId(_id: string | number, sub_type: number | undefined) {
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
