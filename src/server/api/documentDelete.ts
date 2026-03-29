import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import buildId from '@/utils/mappers/buildId'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function documentDelete(c: Context) {
  const { error: optionError } = checkOptions({
    readOnly: false,
    noDelete: false
  })
  if (optionError) {
    return c.json({ error: optionError }, 403)
  }
  const { database, collection, _id, sub_type } = await c.req.json<{
    database: string
    collection: string
    _id: string | number
    sub_type: number | undefined
  }>()
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) {
    return c.json({ error }, 404)
  }
  const { deletedCount } = await globalThis.mongo.mongoClient
    .db(database)
    .collection(collection)
    .deleteOne({ _id: buildId(_id, sub_type) })
  if (deletedCount) {
    return c.json({})
  }
  return c.json({ error: `Document "${_id}" not deleted!` }, 500)
}
