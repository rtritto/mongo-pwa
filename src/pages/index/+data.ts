import type { PageContextServer } from 'vike-lite'

import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data = async (pageContext: PageContextServer<DataIndex>) => {
  const { isAuthorized } = pageContext.data
  if (!isAuthorized) return {}
  const { mongo } = globalThis
  return {
    ...mongo.adminDb && { stats: mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus) }
  } as DataIndex
}
