import type { DataAsync, PageContext } from 'vike/types'

import { connectClient } from '@/server/db'
import { mapCollectionStats } from '@/utils/mappers/mapInfo'
import { getItemsAndCount, getQueryOptions } from '@/utils/queries'
import { bytesToSize, roughSizeOfObject } from '@/utils/mappers/mapUtils'
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
  const { search } = pageContext.urlParsed
  const queryOptions = getQueryOptions(search)
  // TODO check if use this
  // const collection = mongo.connections[dbName].db.collection(collectionName)
  const collection = mongo.mongoClient.db(dbName).collection(collectionName)
  const { count, items } = await getItemsAndCount(search, queryOptions, collection, config)

  const _data = {
    title: `Collection: ${collectionName} - Mongo PWA`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: collectionName,
    selectedDocument: undefined,
    count,
    items
  } as DataCollection

  // const docs = []
  // let columns = []

  // for (const i in items) {
  //   // Prep items with stubs so as not to send large info down the wire
  //   for (const prop in items[i]) {
  //     if (roughSizeOfObject(items[i][prop]) > config.options.maxPropSize) {
  //       items[i][prop] = {
  //         attribu: prop,
  //         display: '*** LARGE PROPERTY ***',
  //         humanSz: bytesToSize(roughSizeOfObject(items[i][prop])),
  //         maxSize: bytesToSize(config.options.maxPropSize),
  //         preview: JSON.stringify(items[i][prop]).slice(0, 25),
  //         roughSz: roughSizeOfObject(items[i][prop]),
  //         _id: items[i]._id
  //       }
  //     }
  //   }

  //   // If after prepping the row is still too big
  //   if (roughSizeOfObject(items[i]) > config.options.maxRowSize) {
  //     for (const prop in items[i]) {
  //       if (prop !== '_id' && roughSizeOfObject(items[i][prop]) > 200) {
  //         items[i][prop] = {
  //           attribu: prop,
  //           display: '*** LARGE ROW ***',
  //           humanSz: bytesToSize(roughSizeOfObject(items[i][prop])),
  //           maxSize: bytesToSize(config.options.maxRowSize),
  //           preview: JSON.stringify(items[i][prop]).slice(0, 25),
  //           roughSz: roughSizeOfObject(items[i][prop]),
  //           _id: items[i]._id
  //         }
  //       }
  //     }
  //   }

  //   docs[i] = items[i]
  //   columns.push(Object.keys(items[i]))
  //   items[i] = bson.toString(items[i])
  // }

  // // Generate an array of columns used by all documents visible on this page
  // columns = columns.flat()
  //   .filter((value, index, arr) => arr.indexOf(value) === index)  // Remove duplicates

  // // Pagination
  // const { limit, skip, sort } = queryOptions
  // const pagination = count > limit

  if (mongo.adminDb && !config.mongodb.awsDocumentDb) {
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
