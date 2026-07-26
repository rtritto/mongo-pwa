import type { PageContextServer } from 'vike-lite'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import { getIsAuthorized } from '@/utils/getIsAuthorized'

export const data = async (pageContext: PageContextServer<DataCumulative>) => {
  const isAuthorized = getIsAuthorized(pageContext)
  if (!isAuthorized) return { isAuthorized }
  await connectClient()
  const { mongo } = globalThis
  return {
    isAuthorized,
    options: config.options,
    databases: mongo.databases,
    selectedDatabase: undefined,
    selectedCollection: undefined,
    selectedDocument: undefined,
    success: undefined,
    warning: undefined,
    error: undefined
  } satisfies DataCumulative
}
