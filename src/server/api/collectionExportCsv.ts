import type { Context } from 'hono'
import { ReadableStream } from 'node:stream/web'

import { connectClient } from '@/server/db'
import { generateCollectionCsv } from '@/server/utils/generateCollectionCsv'
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
  if (error) return c.json({ error }, 404)

  const cursor = globalThis.mongo.mongoClient.db(database).collection(collection).find(getQuery(query), getQueryOptions(query))
  const webStream = ReadableStream.from(generateCollectionCsv(cursor))
  const filename = encodeURI(collection)
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
      Filename: filename
    }
  })
}
