import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import csv from '@/utils/csv'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import { generateCollectionJson } from '../utils/generateCollectionJson'

export default async function collectionExportCsv(c: Context) {
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: QueryParameter
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) return c.json({ error }, 404)

  const cursor = globalThis.mongo.mongoClient.db(database).collection(collection).find(getQuery(query), getQueryOptions(query))
  const webStream = ReadableStream.from(generateCollectionJson(cursor))
  const fileName = encodeURI(collection)
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}.csv"; filename*=UTF-8''${fileName}.csv`,
      'Content-Type': 'text/csv',
      'Filename': fileName
    }
  })
}
