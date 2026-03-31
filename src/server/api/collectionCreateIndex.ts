import type { Context } from 'hono'
import toBSON from 'mongodb-query-parser-esm'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionCreateIndex(c: Context) {
  const { database, collection, doc } = await c.req.json<{
    database: string
    collection: string
    doc: string
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  let _doc
  try {
    _doc = toBSON(doc)
  } catch (error) {
    return c.json({ error: `Failed to parse document: ${(error as Error).message}` }, 400)
  }
  const indexName = await globalThis.mongo.mongoClient.db(database).collection(collection).createIndex(_doc)
  return c.json({ indexName })
}
