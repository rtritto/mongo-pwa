import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function collectionDeleteIndex({ database, collection, indexName }: {
  database: string
  collection: string
  indexName: string
}) {
  await connectClient()
  const { error: optionError } = checkOptions({ readOnly: false, noDelete: false })
  if (optionError) throw new HTTPException(403, { message: optionError })

  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  await globalThis.mongo.mongoClient.db(database).collection(collection).dropIndex(indexName)
  return {}
}
