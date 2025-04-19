import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase } from '@/utils/validations-server'

export default async function collectionRename(c: Context) {
  const { database, collection, newCollection } = await c.req.json()
  checkDatabase(database)
  checkCollection(database, collection)
  await connectClient()
  await globalThis.mongo.mongoClient.db(database).collection(collection).rename(newCollection).catch((error) => {
    console.debug(error)
    throw new Error(`Error to rename collection "${collection}" in "${newCollection}". ${error.message}`)
  })
  return c.json({})
}
