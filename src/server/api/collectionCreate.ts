import type { Context } from 'hono'

import { connectClient } from '@/server/db'

export default async function collectionCreate(c: Context) {
  const { database, collection } = await c.req.json<{
    database: string
    collection: string
  }>()
  await connectClient()
  await globalThis.mongo.mongoClient.db(database).createCollection(collection).catch((error) => {
    console.error(error)
    throw new Error(`Failed to create collection. ${error.message}`)
  })
  return c.json({})
}
