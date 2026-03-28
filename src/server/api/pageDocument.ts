import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import getColumnsAndSetDocs from '@/utils/mappers/getColumnsAndSetDocs'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import isValidCollectionName from '@/utils/validations/isValidCollectionName'
import { checkDatabase } from '@/utils/validations/serverChecks'

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
  const { columns, docs } = getColumnsAndSetDocs(items)
  return c.json({
    count,
    columns,
    docs
  })
}
