import type { Context } from 'hono'

import { connectClient } from '@/server/db'

export default async function collectionCreate(c: Context) {
  const { database, collection } = await c.req.json<{
    database: string
    collection: string
  }>()
  await connectClient()
  await globalThis.mongo.mongoClient.db(database).createCollection(collection)
  return c.json({})
}
