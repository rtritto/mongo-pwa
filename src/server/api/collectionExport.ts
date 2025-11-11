import { EJSON } from 'bson'
import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function collectionExport(c: Context) {
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
    `attachment; filename="${encodeURI(collection)}.json"; filename*=UTF-8''${encodeURI(collection)}.json`
  )
  c.header('Content-Type', 'application/json')
  c.header('Filename', encodeURI(collection))
  return c.body(EJSON.stringify(
    await globalThis.mongo.mongoClient.db(database).collection(collection).find(
      getQuery(query),
      getQueryOptions(query)
    ).toArray()
  ))
}
