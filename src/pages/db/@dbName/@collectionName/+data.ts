import type { DataAsync, PageContext } from 'vike/types'

import { connectClient } from '@/server/db'
import { mapCollectionStats } from '@/utils/mappers/mapInfo'
import { isValidCollectionName, isValidDatabaseName } from '@/utils/validationsClient'

export const data: DataAsync<DataCollection> = async (pageContext: PageContext) => {
  const { dbName, collectionName } = pageContext.routeParams
  const validationDbRes = isValidDatabaseName(dbName)
  if (validationDbRes.error) {
    throw new Error(validationDbRes.error)
  }
  const validationCollRes = isValidCollectionName(collectionName)
  if (validationCollRes.error) {
    throw new Error(validationCollRes.error)
  }
  await connectClient()
  const { config, mongo } = globalThis

  const _data = {
    title: `Collection: ${collectionName} - Mongo PWA`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: undefined
  } as DataCollection

  if (mongo.adminDb && !config.mongodb.awsDocumentDb) {
    const collection = mongo.connections[dbName].db.collection(collectionName)
    const [{ indexSizes }, indexes] = await Promise.all([
      collection.aggregate<CollStats>([{ $collStats: { storageStats: {} } }]).next().then((s) => s.storageStats),
      collection.indexes()
    ])
    for (let n = 0, len = indexes.length; n < len; n++) {
      indexes[n].size = indexSizes[indexes[n].name]
    }
    _data.collectionStats = mapCollectionStats(await mongo.adminDb.serverStatus() as ServerStatus)
  }

  return _data
}
