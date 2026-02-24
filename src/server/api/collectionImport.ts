import { EJSON } from 'bson'
import type { Context } from 'hono'

import { connectClient } from '@/server/db'
import { checkCollection, checkDatabase } from '@/utils/validationsServer'

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/json'
])

export default async function collectionExport(c: Context) {
  const formData = await c.req.formData()
  await connectClient()
  const database = formData.get('database') as string
  checkDatabase(database)
  const collection = formData.get('collection') as string
  checkCollection(database, collection)

  // Ensure the request is multipart
  const contentType = c.req.header('Content-Type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ message: 'Unsupported Content-Type' }, 415)
  }

  const file = formData.get('file') as File

  if (!file) {
    return c.json({ message: 'No file' }, 400)
  }
  if (!ALLOWED_MIME_TYPES.has(file.type) || !(file instanceof File) || file.size === 0) {
    return c.json({ message: 'Bad file' }, 400)
  }

  const fileContent = await file.text()
  const lines = fileContent.split('\n').map((line) => line.trim()).filter(Boolean)
  const docs = []
  for (const line of lines) {
    try {
      const parsedData = EJSON.parse(line)
      // Use for loop instead of spread to avoid stack overflow with large arrays
      for (const doc of parsedData) {
        docs.push(doc)
      }
    } catch (error) {
      console.error(error)
      return c.json({ message: 'Bad file content' }, 400)
    }
  }

  const { insertedCount } = await globalThis.mongo.mongoClient.db(database).collection(collection).insertMany(docs)
  return c.json({ insertedCount })
}
