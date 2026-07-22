import { EJSON } from 'bson'
import type { AbstractCursor, Document } from 'mongodb'

const encoder = new TextEncoder()

export async function* generateCollectionJson(cursor: AbstractCursor<Document>): AsyncGenerator<Uint8Array> {
  yield encoder.encode('[')

  let isFirst = true

  try {
    for await (const doc of cursor) {
      yield encoder.encode((isFirst ? '' : ',') + EJSON.stringify(doc))
      isFirst = false
    }
  } finally {
    await cursor.close()
  }

  yield encoder.encode(']')
}
