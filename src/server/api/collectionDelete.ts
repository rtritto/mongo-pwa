import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { getQuery } from '@/utils/queries'
import { checkCollection, checkDatabase, checkOption } from '@/utils/validations-server'

export default async function collectionDelete(c: Context) {
  // TODO (?) remove checkOption
  checkOption('readOnly', true)
  checkOption('noDelete', true)
  const { database, collection, query } = await c.req.json()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  await (query
    // Delete some documents
    ? _collection.deleteMany(getQuery(query)).then((opRes) => {
      console.info(`Deleted ${opRes.deletedCount} documents from collection "${collection}"`)
    })
    // Drop the whole collection
    : _collection.drop())
  return c.json({})
}
