import type { PageContextServer } from 'vike-lite'

import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data = async (pageContext: PageContextServer<DataIndex>) => {
  const _data = {} as DataIndex
  if (pageContext.data.isAuthorized) {
    const { mongo } = globalThis
    if (mongo.adminDb) _data.stats = mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus)
  }
  return _data
}
