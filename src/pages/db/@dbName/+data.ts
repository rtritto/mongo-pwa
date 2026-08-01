import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import { mapDatabaseStats } from '@/utils/mappers/mapInfo'
import { checkDatabase } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer<DataDB>) => {
  const _data = {} as DataDB
  if (pageContext.data.isAuthorized) {
    const { dbName, collectionName } = pageContext.routeParams
    const { error } = checkDatabase(dbName)
    if (error) throw render(404, error)
    const { mongo } = globalThis
    _data.collections = mongo.collections[dbName]
    _data.selectedCollection = collectionName
    _data.selectedDatabase = dbName
    if (collectionName) return _data
    // Current Page
    if (mongo.adminDb) _data.stats = mapDatabaseStats(await mongo.connections[dbName].db.stats() as DbStats)
    _data.title = `DB: ${dbName} - Mongo Solid`
  }
  return _data
}
