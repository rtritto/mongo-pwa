import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { toJsonString } from '@/utils/bson'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function collectionExportArray(c: Context) {
  const { database, collection, query } = await c.req.json()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  c.header(
    'Content-Disposition',
    `attachment; filename="${encodeURI(collection)}.json"; filename*=UTF-8''${encodeURI(collection)}.json`
  )
  c.header('Content-Type', 'application/json')
  c.header('Filename', encodeURI(collection))
  return c.body(toJsonString(
    await globalThis.mongo.mongoClient.db(database).collection(collection).find(
      getQuery(query),
      getQueryOptions(query)
    ).toArray()
  ))
}
