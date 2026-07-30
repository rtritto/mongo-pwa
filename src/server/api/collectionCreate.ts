import { connectClient } from '@/server/db'

export default async function collectionCreate({ database, collection }: {
  database: string
  collection: string
}) {
  await connectClient()
  await globalThis.mongo.mongoClient.db(database).createCollection(collection)
  return {}
}
