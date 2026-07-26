import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import getColumnsAndSetDocs from '@/utils/mappers/getColumnsAndSetDocs'
import { mapStorageStats } from '@/utils/mappers/mapInfo'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'
import { getIsAuthorized } from '@/utils/getIsAuthorized'

export const data = async (pageContext: PageContextServer) => {
  const isAuthorized = getIsAuthorized(pageContext)
  if (!isAuthorized) return { isAuthorized }
  const { dbName, collectionName } = pageContext.routeParams
  const url = new URL(pageContext.urlOriginal)
  const search = Object.fromEntries(url.searchParams.entries())
  await connectClient()
  const { error } = checkDatabaseCollection(dbName, collectionName)
  if (error) {
    render(404, error)
  }
  const queryOptions = getQueryOptions(search)
  const { mongo } = globalThis
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)
  const { count, items } = await getItemsAndCount(search, queryOptions, collection, config)

  const { columns, docs } = getColumnsAndSetDocs(items)

  let _data
  if (mongo.adminDb && !config.mongodb.awsDocumentDb) {
    const [stats, indexes] = await Promise.all([
      collection.aggregate<CollStats>([{ $collStats: { storageStats: {} } }]).next(),
      collection.indexes()
    ])
    for (const index of indexes) index.size = stats!.storageStats.indexSizes[index.name!]
    _data = {
      stats: mapStorageStats(stats!.storageStats),
      indexes
    }
  } else {
    _data = {}
  }

  return {
    isAuthorized,
    title: `Collection: ${collectionName} - Mongo Solid`,
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
