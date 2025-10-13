import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase, checkDocument } from '@/utils/validationsServer'

export default async function collectionCreateIndex(c: Context) {
  const { database, collection, doc } = await c.req.json<{
    database: string
    collection: string
    doc: string
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  const _doc = checkDocument(doc)
  const indexName = await globalThis.mongo.mongoClient.db(database).collection(collection).createIndex(_doc).catch((error) => {
    console.error(error)
    throw new Error(`Failed to create index. ${error.message}`)
  })
  return c.json({ indexName })
}
