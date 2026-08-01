import type { PageContextServer } from 'vike-lite'

import config from '@/server/config'
import { connectClient } from '@/server/db'
import { getIsAuthorized } from '@/utils/getIsAuthorized'

export const data = async (pageContext: PageContextServer<DataCumulative>) => {
  const isAuthorized = getIsAuthorized(pageContext)
  const _data = {
    options: config.options,
    isAuthorized
  } as DataCumulative
  if (isAuthorized) {
    await connectClient()
    const { mongo } = globalThis
    _data.databases = mongo.databases
    _data.selectedDatabase = undefined
    _data.selectedCollection = undefined
    _data.selectedDocument = undefined
    _data.success = undefined
    _data.warning = undefined
    _data.error = undefined
  }
  return _data
}
