import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function documentList(c: Context) {
  const { database, collection, limit, skip } = await c.req.json<{
    database: string
    collection: string
    limit: number
    skip: number
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  // TODO handle projection, query, aggregation
  const documents = await globalThis.mongo.mongoClient.db(database).collection(collection).find({}, {
    limit,
    skip
  }).toArray()
  return c.json(documents)
}
