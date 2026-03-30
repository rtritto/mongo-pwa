import type { Context } from 'hono'
import toBSON from 'mongodb-query-parser'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import buildId from '@/utils/mappers/buildId'

export default async function documentUpdate(c: Context) {
  const { database, collection, _id, sub_type, doc } = await c.req.json<{
    database: string
    collection: string
    _id: string | number
    sub_type: number | undefined
    doc: string
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  const filter = { _id: buildId(_id, sub_type) }
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  const _doc = await _collection.findOne(filter)
  if (!_doc) {
    return c.json({ error: `Document "${_id}" not found!` }, 404)
  }
  let docBSON
  try {
    docBSON = toBSON(doc)
  } catch (error) {
    return c.json({ error: `Failed to parse document: ${(error as Error).message}` }, 400)
  }
  docBSON._id = _doc._id

  await _collection.replaceOne(filter, docBSON)

  return c.json({})
}
