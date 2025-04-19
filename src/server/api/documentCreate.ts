import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase, checkDocument } from '@/utils/validations-server'

export default async function documentCreate(c: Context) {
  const { database, collection, doc } = await c.req.json()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  const _doc = checkDocument(doc)
  await globalThis.mongo.mongoClient.db(database).collection(collection).insertOne(_doc)
  return c.json({})
}
