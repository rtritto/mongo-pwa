import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { buildId } from '@/utils/mappers/mapUtils'
import { checkCollection, checkDatabase, checkOption } from '@/utils/validationsServer'

export default async function documentDelete(c: Context) {
  // TODO (?) remove checkOption
  checkOption('readOnly', true)
  checkOption('noDelete', true)
  const { database, collection, _id, _subtype } = await c.req.json<{
    database: string
    collection: string
    _id: string | number
    _subtype: number | undefined
  }>()
  await connectClient()
  checkDatabase(database)
  checkCollection(database, collection)
  const { deletedCount } = await globalThis.mongo.mongoClient
    .db(database)
    .collection(collection)
    .deleteOne({ _id: buildId(_id, _subtype) })
  if (!deletedCount) {
    throw new Error('Document not deleted!')
  }
  return c.json({})
}
