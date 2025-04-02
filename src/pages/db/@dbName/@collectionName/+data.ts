import type { DataSync, PageContext } from 'vike/types'

import { mapCollectionStats } from '@/utils/mappers/mapInfo'

export const data: DataSync<DataCollection> = async (pageContext: PageContext) => {
  const { dbName, collectionName } = pageContext.routeParams
  // TODO
  // const validationDbRes = isValidDatabaseName(dbName)
  // if ('error' in validationDbRes) {
  //   throw new Error(validationDbRes.error)
  // }
  // const validationCollRes = isValidCollectionName(collectionName)
  // if ('error' in validationCollRes) {
  //   throw new Error(validationCollRes.error)
  // }
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
    const [stats, indexes] = await Promise.all([
      collection.aggregate<CollStats>([{ $collStats: { storageStats: {} } }]).next().then((s) => s.storageStats),
      collection.indexes()
    ])
    const { indexSizes } = stats
    for (let n = 0, len = indexes.length; n < len; n++) {
      indexes[n].size = indexSizes[indexes[n].name]
    }
    _data.collectionStats = mapCollectionStats(await mongo.adminDb.serverStatus() as ServerStatus)
  }

  return _data
}
