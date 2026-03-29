import { connectClient } from '@/server/db'
import getColumnsAndSetDocs from '@/utils/mappers/getColumnsAndSetDocs'
import { mapCollectionStats } from '@/utils/mappers/mapInfo'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import isValidDatabaseName from '@/utils/validations/isValidDatabaseName'
import isValidCollectionName from '@/utils/validations/isValidCollectionName'

export const data = async (pageContext: PageContextServer) => {
  const { dbName, collectionName } = pageContext.routeParams
  const validationDbRes = isValidDatabaseName(dbName)
  if (validationDbRes.error) {
    throw new Error(validationDbRes.error)
  }
  const { error } = isValidCollectionName(collectionName)
  if (error) {
    throw new Error(error)
  }
  const { search } = pageContext.urlParsed
  await connectClient()
  const queryOptions = getQueryOptions(search)
  const { mongo, config } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)
  const { count, items } = await getItemsAndCount(search, queryOptions, collection, config)

  const { columns, docs } = getColumnsAndSetDocs(items)

  let _data
  if (mongo.adminDb && !config.mongodb.awsDocumentDb) {
    const [stats, indexes] = await Promise.all([
      collection.aggregate<CollStats>([{ $collStats: { storageStats: {} } }]).next().then((s) => s.storageStats),
      collection.indexes()
    ]) as [CollStats, Index[]]
    const { indexSizes } = stats
    for (let n = 0, len = indexes.length; n < len; n++) {
      indexes[n].size = indexSizes[indexes[n].name]
    }
    _data = {
      stats: mapCollectionStats(stats),
      indexes
    }
  } else {
    _data = {}
  }

  return {
    title: `Collection: ${collectionName} - Mongo PWA`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: undefined,
    success: undefined,
    warning: undefined,
    error: undefined,
    docs,
    // Generate an array of columns used by all documents visible on this page
    columns,
    // Pagination
    count,
    documentsPerPage: config.options.documentsPerPage,
    aggregate: search?.aggregate === 'true',
    query: search?.query,
    projection: search?.projection,
    ..._data
  }
}
