import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionRename(c: Context) {
  const { database, collection, newCollection } = await c.req.json<{
    database: string
    collection: string
    newCollection: string
  }>()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  await connectClient()
  try {
    await globalThis.mongo.mongoClient.db(database).collection(collection).rename(newCollection)
  } catch (error) {
    console.debug(error)
    throw new Error(`Error to rename collection "${collection}" in "${newCollection}". ${(error as Error).message}`)
  }
  return c.json({})
}
