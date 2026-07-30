import { HTTPException } from 'hono/http-exception'
import toBSON from 'mongodb-query-parser-esm'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import buildId from '@/utils/mappers/buildId'

export default async function documentUpdate({ database, collection, _id, sub_type, doc }: {
  database: string
  collection: string
  _id: string | number
  sub_type: number | undefined
  doc: string
}) {
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  const filter = { _id: buildId(_id, sub_type) }
  const _collection = globalThis.mongo.mongoClient.db(database).collection<typeof filter>(collection)
  const _doc = await _collection.findOne(filter)
  if (!_doc) throw new HTTPException(404, { message: `Document "${_id}" not found!` })

  let docBSON
  try {
    docBSON = toBSON(doc)
  } catch (error) {
    throw new HTTPException(400, { message: `Failed to parse document: ${(error as Error).message}` })
  }
  docBSON._id = _doc._id
  await _collection.replaceOne(filter, docBSON)
  return {}
}
