import type { PageContextServer } from 'vike-lite'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import { getIsAuthorized } from '@/utils/getIsAuthorized'

export const data = async (pageContext: PageContextServer<DataCumulative>) => {
  const isAuthorized = getIsAuthorized(pageContext)
  const _data = {
    options: config.options,
    isAuthorized
  }
  if (!isAuthorized) return _data
  await connectClient()
  const { mongo } = globalThis
  return {
    databases: mongo.databases,
    ..._data,
    selectedDatabase: undefined,
    selectedCollection: undefined,
    selectedDocument: undefined,
    success: undefined,
    warning: undefined,
    error: undefined
  } satisfies DataCumulative
}
