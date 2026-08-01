import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import config from '@/server/config'
import getColumnsAndSetDocs from '@/utils/mappers/getColumnsAndSetDocs'
import { mapStorageStats } from '@/utils/mappers/mapInfo'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import { checkDatabaseCollection } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer<DataCollection>) => {
  const _data = {} as DataCollection
  if (pageContext.data.isAuthorized) {
    const { dbName, collectionName, document } = pageContext.routeParams
    const url = new URL(pageContext.urlOriginal)
    const search = Object.fromEntries(url.searchParams.entries())
    const { error } = checkDatabaseCollection(dbName, collectionName)
    if (error) throw render(404, error)
    const queryOptions = getQueryOptions(search)
    const { mongo } = globalThis
    // TODO check if use this
    // const collection = mongo.connections[dbName].db.collection(collectionName)
    const collection = mongo.mongoClient.db(dbName).collection(collectionName)
    _data.selectedCollection = collectionName
    if (document) return _data
    // Current Page
    const { count, items } = await getItemsAndCount(search, queryOptions, collection, config)
    const { columns, docs } = getColumnsAndSetDocs(items)
    if (mongo.adminDb && !config.mongodb.awsDocumentDb) {
      const [stats, indexes] = await Promise.all([
        collection.aggregate<CollStats>([{ $collStats: { storageStats: {} } }]).next(),
        collection.indexes()
      ])
      for (const index of indexes) index.size = stats!.storageStats.indexSizes[index.name!]
      _data.stats = mapStorageStats(stats!.storageStats)
      _data.indexes = indexes
    }
    _data.title = `Collection: ${collectionName} - Mongo Solid`
    _data.docs = docs
    // Generate an array of columns used by all documents visible on this page
    _data.columns = columns
    // Pagination
    _data.count = count
    _data.documentsPerPage = config.options.documentsPerPage
    _data.aggregate = search.aggregate === 'true'
    _data.query = search.query
    _data.projection = search.projection
  }
  return _data
}
