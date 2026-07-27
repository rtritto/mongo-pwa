import { ReadableStream } from 'node:stream/web'
import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { generateCollectionJson } from '@/server/utils/generateCollectionJson'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

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
  const filename = encodeURI(collection)
  // @ts-expect-error Response should be from Node.js, not from the DOM lib
  // tsconfig.json lib imports Client (DOM and DOM.Iterable) and Server (@types/node)
  // Both includes Response but TypeScript resolves Response as Client
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/json; charset=utf-8',
      Filename: filename
    }
  })
}
