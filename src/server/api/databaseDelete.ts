import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'
import { checkOptions } from '@/utils/validations/serverChecks'

export default async function databaseDelete({ database }: { database: string }) {
  await connectClient()
  const { error: optionError } = checkOptions({ readOnly: false, noDelete: false })
  if (optionError) throw new HTTPException(403, { message: optionError })

  try {
    await globalThis.mongo.mongoClient.db(database).dropDatabase()
  } catch (error) {
    console.debug(error)
    throw new HTTPException(500, { message: `Failed to delete database "${database}". ${(error as Error).message}` })
  }
  return {}
}
