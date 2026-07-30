import { HTTPException } from 'hono/http-exception'
import toBSON from 'mongodb-query-parser-esm'

import { connectClient } from '@/server/db'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export default async function documentCreate({ database, collection, doc }: {
  database: string
  collection: string
  doc: string
}) {
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  let _doc
  try {
    _doc = toBSON(doc)
  } catch (error) {
    throw new HTTPException(400, { message: `Failed to parse document: ${(error as Error).message}` })
  }

  const { insertedId } = await globalThis.mongo.mongoClient.db(database).collection(collection).insertOne(_doc)
  return { insertedId }
}
