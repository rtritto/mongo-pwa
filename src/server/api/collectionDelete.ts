import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { getQuery } from '@/utils/queries'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function collectionDelete(c: Context) {
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: QueryParameter
  }>()
  await connectClient()
  const { error: optionError } = checkOptions({
    readOnly: false,
    noDelete: false
  })
  if (optionError) {
    return c.json({ error: optionError }, 403)
  }
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  if (query) {
    // Delete some documents
    await _collection.deleteMany(getQuery(query)).then((opRes) => {
      console.info(`Deleted ${opRes.deletedCount} documents from collection "${collection}"`)
    })
  } else {
    // Drop the whole collection
    const result = await _collection.drop()
    if (!result) {
      throw new Error(`Failed to delete collection "${collection}"`)
    }
  }
  return c.json({})
}
