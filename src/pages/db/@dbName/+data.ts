import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import { mapDatabaseStats } from '@/utils/mappers/mapInfo'
import { checkDatabase } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer<DataDB>) => {
  const isAuthorized = pageContext.data.isAuthorized
  if (!isAuthorized) return {}
  const { dbName, collectionName } = pageContext.routeParams
  const { error } = checkDatabase(dbName)
  if (error) throw render(404, error)
  const { mongo } = globalThis
  const _data = {
    collections: mongo.collections[dbName],
    selectedCollection: collectionName,
    selectedDatabase: dbName
  } as Partial<DataDB>
  if (collectionName) return _data
  // Current Page
  return {
    title: `DB: ${dbName} - Mongo Solid`,
    ..._data,
    ...mongo.adminDb && { stats: mapDatabaseStats(await mongo.connections[dbName].db.stats() as DbStats) }
  } satisfies Partial<DataDB>
}
