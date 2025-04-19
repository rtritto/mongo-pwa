import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase, checkDocument } from '@/utils/validationsServer'
import { buildId } from '@/utils/mappers/mapUtils'

export default async function documentList(c: Context) {
  const { database, collection, _id, _subtype, doc } = await c.req.json<{
    database: string
    collection: string
    _id: string | number
    _subtype: number | undefined
    doc: string
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  const filter = { _id: buildId(_id, _subtype) }
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  const _doc = await _collection.findOne(filter)
  if (_doc === null) {
    throw new Error('Document not found!')
  }

  const docBSON = checkDocument(doc)
  docBSON._id = _doc._id

  await _collection.replaceOne(filter, docBSON)

  return c.json({})
}
