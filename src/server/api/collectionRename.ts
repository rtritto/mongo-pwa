import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionRename({ database, collection, newCollection }: {
  database: string
  collection: string
  newCollection: string
}) {
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  await connectClient()
  try {
    await globalThis.mongo.mongoClient.db(database).collection(collection).rename(newCollection)
  } catch (error) {
    console.debug(error)
    throw new HTTPException(500, { message: `Error to rename collection "${collection}" in "${newCollection}". ${(error as Error).message}` })
  }
  return {}
}
