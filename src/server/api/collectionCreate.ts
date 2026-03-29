import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabase } from '@/utils/validations/serverChecks'

export default async function collectionCreate(c: Context) {
  const { database, collection } = await c.req.json<{
    database: string
    collection: string
  }>()
  await connectClient()
  checkDatabase(database)
  await globalThis.mongo.mongoClient.db(database).createCollection(collection).catch((error) => {
    console.error(error)
    throw new Error(`Failed to create collection. ${error.message}`)
  })
  return c.json({})
}
