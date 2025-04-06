import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabase } from '@/utils/validations'

export default async function databaseDelete(c: Context) {
  const { database } = await c.req.json()
  await connectClient()
  checkDatabase(database)
  await globalThis.mongo.mongoClient.db(database).createCollection('delete_me').catch((error) => {
    console.debug(error)
    throw new Error(`Failed to create collection. ${error.message}`)
  })
  return c.res.json()
}
