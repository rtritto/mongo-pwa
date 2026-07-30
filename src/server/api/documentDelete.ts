import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import buildId from '@/utils/mappers/buildId'
import { checkDatabaseCollection, checkOptions } from '@/utils/validations/serverChecks'

export default async function documentDelete({ database, collection, _id, sub_type }: {
  database: string
  collection: string
  _id: string | number
  sub_type: number | undefined
}) {
  const { error: optionError } = checkOptions({ readOnly: false, noDelete: false })
  if (optionError) throw new HTTPException(403, { message: optionError })
  await connectClient()
  const { error } = checkDatabaseCollection(database, collection)
  if (error) throw new HTTPException(404, { message: error })

  const filter = { _id: buildId(_id, sub_type) }
  const { deletedCount } = await globalThis.mongo.mongoClient
    .db(database)
    .collection<typeof filter>(collection)
    .deleteOne(filter)
  if (deletedCount === 0)
    throw new HTTPException(500, { message: `Document "${_id}" not deleted!` })
  return {}
}
