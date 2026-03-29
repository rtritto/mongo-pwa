import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import csv from '@/utils/csv'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionExportCsv(c: Context) {
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: QueryParameter
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
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
