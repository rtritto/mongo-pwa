import type { PageContextServer } from 'vike-lite'
import { render } from 'vike-lite/server/abort'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import { mapDatabaseStats } from '@/utils/mappers/mapInfo'
import { checkDatabase } from '@/utils/validations/serverChecks'

export const data = async (pageContext: PageContextServer) => {
  const { dbName } = pageContext.routeParams
  await connectClient()
  const { error } = checkDatabase(dbName)
  if (error) {
    render(404, error)
  }
  const { mongo } = globalThis

  return {
    title: `DB: ${dbName} - Mongo Solid`,
    databases: mongo.databases,
    collections: mongo.collections[dbName],
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options: config.options,
    selectedDatabase: dbName,
    selectedCollection: undefined,
    selectedDocument: undefined,
    success: undefined,
    warning: undefined,
    error: undefined,
    ...mongo.adminDb && { stats: mapDatabaseStats(await mongo.connections[dbName].db.stats() as DbStats) }
  }
}
