import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { getQuery } from '@/utils/queries'
import { checkCollection, checkDatabase, checkOption } from '@/utils/validationsServer'

export default async function collectionDelete(c: Context) {
  // TODO (?) remove checkOption
  checkOption('readOnly', true)
  checkOption('noDelete', true)
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: QueryParameter
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
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
      throw new Error('Failed to delete collection')
    }
  }
  return c.json({})
}
