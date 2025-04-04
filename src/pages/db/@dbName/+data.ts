import type { DataAsync, PageContext } from 'vike/types'

import { connectClient } from '@/server/db'
import { mapDatabaseStats } from '@/utils/mappers/mapInfo'

// TODO
// const _getItemsAndCount = async function (req, queryOptions) {
//   let query = exp._getQuery(req)
//   if (req.query.runAggregate === 'on' && query.constructor.name === 'Array') {
//     if (query.length > 0) {
//       const queryAggregate = exp._getAggregatePipeline(query, queryOptions)
//       const [resultArray] = await req.collection.aggregate(queryAggregate, { allowDiskUse: config.mongodb.allowDiskUse }).toArray()
//       const { items, count } = resultArray
//       return {
//         items,
//         count: count.at(0)?.count
//       }
//     }
//     query = {}
//   }

//   if (config.mongodb.allowDiskUse && !config.mongodb.awsDocumentDb) {
//     queryOptions.allowDiskUse = true
//   }

//   const [items, count] = await Promise.all([
//     req.collection.find(query, queryOptions).toArray(),
//     req.collection.count(query)
//   ])
//   return {
//     items,
//     count
//   }
// }

export const data: DataAsync<DataDB> = async (pageContext: PageContext) => {
  const { dbName } = pageContext.routeParams
  // TODO
  // const validationRes = isValidDatabaseName(dbName)
  // if ('error' in validationRes) {
  //   throw new Error(validationRes.error)
  // }
  await connectClient()
  const { config, mongo } = globalThis

  const _data = {
    title: `DB: ${dbName} - Mongo PWA`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: undefined,
    selectedDocument: undefined
  } as DataDB

  if (mongo.adminDb) {
    _data.dbStats = mapDatabaseStats(await mongo.connections[dbName].db.stats() as DbStats)
  }

  return _data
}
