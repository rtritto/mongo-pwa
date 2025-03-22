
import type { DataAsync } from 'vike/types'

import { mapServerStatus } from '@/utils/mappers/mapInfo'

export const data: DataAsync<DataIndex> = async () => {
  const { config, mongo } = global
  return {
    databases: mongo.databases,
    options: config.options,
    ...mongo.adminDb !== null && {
      serverStatus: mapServerStatus(await mongo.adminDb.serverStatus() as ServerStatus)
    }
  }
}
