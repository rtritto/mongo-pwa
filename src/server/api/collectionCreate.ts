import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { isValidCollectionName } from '@/utils/validations-client'
import { checkDatabase } from '@/utils/validations-server'

export default async function collectionCreate(c: Context) {
  const { database, collection } = await c.req.json()
  isValidCollectionName(collection)
  await connectClient()
  checkDatabase(database)
  await globalThis.mongo.mongoClient.db(database).createCollection(collection).catch((error) => {
    console.debug(error)
    throw new Error(`Failed to create collection. ${error.message}`)
  })
  return c.json({})
}
