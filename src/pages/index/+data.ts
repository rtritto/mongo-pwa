import type { PageContextServer } from 'vike-lite'

import { mapServerStats } from '@/utils/mappers/mapInfo'

export const data = async (pageContext: PageContextServer<DataIndex>) => {
  const { isAuthorized } = pageContext.data
  if (!isAuthorized) return { isAuthorized }
  const { mongo } = globalThis
  return {
    isAuthorized,
    ...mongo.adminDb && { stats: mapServerStats(await mongo.adminDb.serverStatus() as ServerStatus) }
  } satisfies Partial<DataIndex>
}
