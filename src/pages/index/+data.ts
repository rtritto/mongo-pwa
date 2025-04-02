import type { DataAsync } from 'vike/types'

import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data: DataAsync<DataIndex> = async () => {
  const { config, mongo } = globalThis

  const _data = {
    databases: mongo.databases,
    options: config.options,
    selectedDatabase: undefined,
    selectedCollection: undefined,
    selectedDocument: undefined
  } as DataIndex

  if (mongo.adminDb) {
    _data.serverStats = mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus)
  }

  return _data
}
