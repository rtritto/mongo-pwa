import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkOptions } from '@/utils/validations/serverChecks'

export default async function databaseDelete(c: Context) {
  const { database } = await c.req.json<{ database: string }>()
  await connectClient()
  const { error: optionError } = checkOptions({
    readOnly: false,
    noDelete: false
  })
  if (optionError) {
    return c.json({ error: optionError }, 403)
  }
  try {
    await globalThis.mongo.mongoClient.db(database).dropDatabase()
  } catch (error) {
    console.debug(error)
    throw new Error(`Failed to delete database. ${(error as Error).message}`)
  }
  return c.json({})
}
