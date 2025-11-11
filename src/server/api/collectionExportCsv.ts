import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import csv from '@/utils/csv'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function collectionExportArray(c: Context) {
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: QueryParameter
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  c.header(
    'Content-Disposition',
    `attachment; filename="${encodeURI(collection)}.csv"; filename*=UTF-8''${encodeURI(collection)}.csv`
  )
  c.header('Content-Type', 'text/csv')
  c.header('Filename', encodeURI(collection))
  return c.body(csv(
    await globalThis.mongo.mongoClient.db(database).collection(collection).find(
      getQuery(query),
      getQueryOptions(query)
    ).toArray()
  ))
}
