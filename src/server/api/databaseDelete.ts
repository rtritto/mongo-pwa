import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabase } from '@/utils/validations-server'

export default async function databaseDelete(c: Context) {
  const { database } = await c.req.json()
  await connectClient()
  checkDatabase(database)
  await globalThis.mongo.mongoClient.db(database).dropDatabase()
    .catch((error) => {
      console.debug(error)
      throw new Error(`Failed to delete database. ${error.message}`)
    })
  return c.json({})
}
