import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { isValidCollectionName } from '@/utils/validationsClient'
import { checkDatabase } from '@/utils/validationsServer'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'

export default async function collectionCreate(c: Context) {
  const query = await c.req.json<{
    database: string
    collection: string
  } & QueryParameter>()
  const { database, collection } = query
  isValidCollectionName(collection)
  await connectClient()
  checkDatabase(database)
  const queryOptions = getQueryOptions(query)
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  const { count, items } = await getItemsAndCount(query, queryOptions, _collection, globalThis.config)
  return c.json({
    count,
    items
  })
}
