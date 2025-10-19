import { connectClient } from '@/server/db'
import { mapDatabaseStats } from '@/utils/mappers/mapInfo'
import { isValidDatabaseName } from '@/utils/validationsClient'

export const data: DataAsync<DataDB> = async (pageContext) => {
  const { dbName } = pageContext.routeParams
  const validationRes = isValidDatabaseName(dbName)
  if (validationRes.error) {
    throw new Error(validationRes.error)
  }
  await connectClient()
  const { config, mongo } = globalThis

  const _data = {
    title: `DB: ${dbName} - Mongo PWA`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: undefined,
    selectedDocument: undefined,
    error: undefined
  } as DataDB

  if (mongo.adminDb) {
    _data.stats = mapDatabaseStats(await mongo.connections[dbName].db.stats() as DbStats)
  }

  return _data
}
