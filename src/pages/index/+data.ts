import { connectClient } from '@/server/db'
import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data: DataAsync<DataIndex> = async () => {
  await connectClient()
  const { config, mongo } = globalThis

  const _data = {
    databases: mongo.databases,
    // (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
    options: config.options,
    selectedDatabase: undefined,
    selectedCollection: undefined,
    selectedDocument: undefined,
    error: undefined
  } as DataIndex

  if (mongo.adminDb) {
    _data.stats = mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus)
  }

  return _data
}
