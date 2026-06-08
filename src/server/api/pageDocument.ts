import type { Context } from 'hono'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import getColumnsAndSetDocs from '@/utils/mappers/getColumnsAndSetDocs'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function pageDocument(c: Context) {
  const query = await c.req.json<{
    database: string
    collection: string
  } & QueryParameter>()
  const { database, collection } = query
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  const queryOptions = getQueryOptions(query)
  const _collection = globalThis.mongo.mongoClient.db(database).collection(collection)
  const { count, items } = await getItemsAndCount(query, queryOptions, _collection, config)
  const { columns, docs } = getColumnsAndSetDocs(items)
  return c.json({
    count,
    columns,
    docs
  })
}
