import type { SetStoreFunction } from 'solid-js/store'

const handleFetchError = async (
  inputFetch: Promise<Response>,
  setData: SetStoreFunction<any>,
  newData?: Record<string, any>
): Promise<Response | void> => {
  return inputFetch.then(async (response) => {
    if (response.ok) {
      if (newData) {
        setData(newData)
      }
      return response
    }
    const { error } = await response.json() as { error: string }
    setData('error', error)
  }).catch((error) => {
    setData('error', (error as Error).message)
  })
}

export default handleFetchError
