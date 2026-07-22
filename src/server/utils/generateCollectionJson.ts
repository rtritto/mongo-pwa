import { EJSON } from 'bson'

const encoder = new TextEncoder()

export async function* generateCollectionJson(cursor: AsyncIterable<unknown>): AsyncGenerator<Uint8Array> {
  yield encoder.encode('[')

  let isFirst = true
  for await (const doc of cursor) {
    yield encoder.encode((isFirst ? '' : ',') + EJSON.stringify(doc))
    isFirst = false
  }

  yield encoder.encode(']')
}
