import { ReadableStream } from 'node:stream/web'
import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import { generateCollectionJson } from '@/server/utils/generateCollectionJson'

export default async function collectionExport(c: Context) {
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
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURI(collection)}.json"`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
