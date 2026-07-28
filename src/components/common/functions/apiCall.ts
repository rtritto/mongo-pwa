import type { SetStoreFunction } from 'solid-js/store'

import { HEADERS } from '@/components/utils/getHeaders'

const apiCall = async (
  url: string,
  body: BodyInit,
  setData: SetStoreFunction<any>,
  newData?: Record<string, any>,
  addHeaders = true
): Promise<Response | void> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: addHeaders ? HEADERS : undefined,
      body
    })
    if (response.ok) {
      if (newData) {
        setData(newData)
      }
      return response
    }
    const { error } = await response.json() as { error: string }
    setData('error', error)
  } catch (error) {
    setData('error', (error as Error).message)
  }
}

export default apiCall
