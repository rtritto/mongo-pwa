import { ReadableStream } from 'node:stream/web'
import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { generateCollectionCsv } from '@/server/utils/generateCollectionCsv'
import { getQuery, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function collectionExportCsv({ database, collection, query }: {
  database: string
  collection: string
  query: QueryParameter
}) {
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  const cursor = globalThis.mongo.mongoClient.db(database).collection(collection).find(getQuery(query), getQueryOptions(query))
  const webStream = ReadableStream.from(generateCollectionCsv(cursor))
  const filename = encodeURI(collection)
  // @ts-expect-error Response should be from Node.js, not from the DOM lib
  // tsconfig.json lib imports Client (DOM and DOM.Iterable) and Server (@types/node)
  // Both includes Response but TypeScript resolves Response as Client
  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'text/csv; charset=utf-8',
      Filename: filename
    }
  })
}
