import type { SetStoreFunction } from 'solid-js/store'

import type { ApiRoutesMap } from '@/server/api'
import { HEADERS } from '@/components/utils/getHeaders'

type BaseStore = { error?: string | null;[key: string]: any }

const apiCall = async <U extends keyof ApiRoutesMap, TStore extends BaseStore>(
  url: U,
  body: ApiRoutesMap[U]['body'] | FormData,
  setData: SetStoreFunction<TStore>,
  newData?: Partial<TStore>,
  addHeaders = true
): Promise<ApiRoutesMap[U]['response'] | undefined> => {
  try {
    // 1. Handle FormData safely (do not stringify it)
    const isFormData = body instanceof FormData
    const finalHeaders = addHeaders ? { ...HEADERS } : undefined
    if (isFormData && finalHeaders && 'Content-Type' in finalHeaders) delete (finalHeaders as any)['Content-Type']

    const fetchBody = isFormData ? body : JSON.stringify(body)
    const response = await fetch(url, {
      method: 'POST',
      headers: finalHeaders,
      body: fetchBody
    })

    if (response.ok) {
      if (newData) setData(newData as TStore)
      const contentType = response.headers.get('content-type') || ''
      const isAttachment = response.headers.get('content-disposition')?.includes('attachment')

      if (!isAttachment && contentType.includes('application/json')) {
        const data = await response.json() as ApiRoutesMap[U]['response']
        return data
      }

      return response as unknown as ApiRoutesMap[U]['response']
    }

    let errorMsg = 'Unknown error'
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const errData = await response.json()
      errorMsg = errData.error || errorMsg
    } else {
      errorMsg = await response.text()
    }
    setData({ error: errorMsg } as TStore)
  } catch (error) {
    setData({ error: (error as Error).message } as TStore)
  }
}

export default apiCall
