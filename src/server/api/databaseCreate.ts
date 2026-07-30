import { HTTPException } from 'hono/http-exception'

import { connectClient } from '@/server/db'

export default async function databaseCreate({ database }: { database: string }) {
  await connectClient()
  try {
    await globalThis.mongo.mongoClient.db(database).createCollection('delete_me')
  } catch (error) {
    console.debug(error)
    throw new HTTPException(500, { message: `Failed to create database "${database}". ${(error as Error).message}` })
  }
  return {}
}
