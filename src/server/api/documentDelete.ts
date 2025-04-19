import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { buildId } from '@/utils/mappers/mapUtils'
import { checkCollection, checkDatabase, checkOption } from '@/utils/validationsServer'

export default async function documentDelete(c: Context) {
  // TODO (?) remove checkOption
  checkOption('readOnly', true)
  checkOption('noDelete', true)
  const { database, collection, _id, _subtype } = await c.req.json<{
    database: string
    collection: string
    _id: string | number
    _subtype: number | undefined
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
  await _collection.deleteOne(filter)
  return c.json({})
}
