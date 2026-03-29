import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionDeleteIndex(c: Context) {
  const { database, collection, indexName } = await c.req.json<{
    database: string
    collection: string
    indexName: string
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  await globalThis.mongo.mongoClient.db(database).collection(collection).dropIndex(indexName).catch((error) => {
    console.error(error)
    throw new Error(`Failed to delete index. ${error.message}`)
  })
  return c.json({})
}
