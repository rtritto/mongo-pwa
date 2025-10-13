import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function collectionDeleteIndex(c: Context) {
  const { database, collection, indexName } = await c.req.json<{
    database: string
    collection: string
    indexName: string
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  await globalThis.mongo.mongoClient.db(database).collection(collection).dropIndex(indexName).catch((error) => {
    console.error(error)
    throw new Error(`Failed to delete index. ${error.message}`)
  })
  return c.json({})
}
