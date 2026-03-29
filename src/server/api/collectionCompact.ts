import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

type ResultCompact = {
  session: {
    success: boolean
  }
}

export default async function collectionCompact(c: Context) {
  const { database, collection } = await c.req.json<{
    database: string
    collection: string
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  const { session: { success } } = await globalThis.mongo.mongoClient.db(database).command({ compact: collection }) as ResultCompact
  return c.json({}, success ? 200 : 500)
}
