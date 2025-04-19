import type { Context } from 'hono'
import type { Sort } from 'mongodb'

import { connectClient } from '@/server/db'
import { toJsonString } from '@/utils/bson'
import { getProjection, getQuery, getSort } from '@/utils/queries'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

export default async function collectionExport(c: Context) {
  const { database, collection, query } = await c.req.json<{
    database: string
    collection: string
    query: {
      sort: string
      projection: string
    }
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
  const queryOptions = {} as {
    sort: Sort
    projection: Document
  }
  if (query.sort) {
    queryOptions.sort = getSort(query.sort)
  }
  if (query.projection) {
    queryOptions.projection = getProjection(query.projection)
  }
  const nodeStream = globalThis.mongo.mongoClient.db(database).collection(collection)
    .find(
      getQuery(query),
      queryOptions
    )
    .stream({
      transform(item) {
        return toJsonString(item) as unknown as Document  // is a string
      }
    })
  return c.body(nodeStream as unknown as Uint8Array<ArrayBufferLike>)
}
