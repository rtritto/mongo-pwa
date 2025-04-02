import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabase } from '@/utils/validations'

export default async function databaseDelete(c: Context) {
  const { dbName } = await c.req.json()
  const client = await connectClient()
  checkDatabase(dbName)
  await client.db(dbName).dropDatabase()
    .catch((error) => {
      console.debug(error)
      throw new Error(`Failed to delete database. ${error.message}`)
    })
  return c.res.json()
}
