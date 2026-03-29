import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import toBSON from '@/utils/mongodb-query-parser'

export default async function documentCreate(c: Context) {
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
  const { insertedId } = await globalThis.mongo.mongoClient.db(database).collection(collection).insertOne(_doc)
  return c.json({ insertedId })
}
