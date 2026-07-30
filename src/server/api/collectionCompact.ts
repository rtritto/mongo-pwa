import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

type ResultCompact = {
  session: {
    success: boolean
  }
}

export default async function collectionCompact({ database, collection }: {
  database: string
  collection: string
}) {
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  const { session: { success } } = await globalThis.mongo.mongoClient.db(database).command({ compact: collection }) as ResultCompact
  if (!success) throw new HTTPException(500, { message: `Failed to compact collection "${collection}"` })

  return {}
}
