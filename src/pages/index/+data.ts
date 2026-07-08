import config from '@/server/config'
import { connectClient } from '@/server/db'
import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data = async () => {
  await connectClient()
  const { mongo } = globalThis

  return {
    databases: mongo.databases,
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options: config.options,
    selectedDatabase: undefined,
    selectedCollection: undefined,
    selectedDocument: undefined,
    success: undefined,
    warning: undefined,
    error: undefined,
    ...mongo.adminDb && { stats: mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus) }
  }
}
