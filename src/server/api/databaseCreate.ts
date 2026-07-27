import type { Context } from 'hono'

import { connectClient } from '@/server/db'

export default async function databaseCreate(c: Context) {
  const { database } = await c.req.json<{ database: string }>()
  await connectClient()
  try {
    await globalThis.mongo.mongoClient.db(database).createCollection('delete_me')
  } catch (error) {
    console.debug(error)
    throw new Error(`Failed to create database "${database}". ${(error as Error).message}`)
  }
  return c.json({})
}
