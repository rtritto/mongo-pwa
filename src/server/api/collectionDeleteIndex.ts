import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function collectionDeleteIndex(c: Context) {
  const { database, collection, indexName } = await c.req.json<{
    database: string
    collection: string
    indexName: string
  }>()
  await connectClient()
  const { error: optionError } = checkOptions({
    readOnly: false,
    noDelete: false
  })
  if (optionError) {
    return c.json({ error: optionError }, 403)
  }
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  await globalThis.mongo.mongoClient.db(database).collection(collection).dropIndex(indexName)
  return c.json({})
}
