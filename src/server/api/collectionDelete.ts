import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { getQuery } from '@/utils/queries'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function collectionDelete({ database, collection, query }: {
  database: string
  collection: string
  query?: QueryParameter
}) {
  await connectClient()
  const { error: optionError } = checkOptions({ readOnly: false, noDelete: false })
  if (optionError) throw new HTTPException(403, { message: optionError })

  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  if (query) {
    // Delete some documents
    const { deletedCount } = await _collection.deleteMany(getQuery(query))
    console.info(`Deleted ${deletedCount} documents from collection "${collection}"`)
  } else {
    // Drop the whole collection
    const result = await _collection.drop()
    if (!result) throw new Error(`Failed to delete collection "${collection}"`)
  }
  return {}
}
