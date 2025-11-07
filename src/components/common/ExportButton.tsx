import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import handleFetchError from '@/components/common/handleFetchError'
import IconExport from '@/components/Icons/IconExport'
import { HEADERS_JSON } from '@/utils/constants'

const ExportButton: Component<{
  label: string
  collection: string
  query: QueryParameter
  data: DataDB
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <button class="btn btn-sm bg-yellow-600" onClick={() => handleFetchError(
      fetch('/api/collectionExport', {
        method: 'POST',
        body: JSON.stringify({
          query: props.query,
          database: props.data.selectedDatabase,
          collection: props.collection
        }),
        headers: HEADERS_JSON(props.data.options)
      }),
      props.setData
    ).then(async (response) => {
      if (response) {
        const blob = await response.blob()
        const url = globalThis.URL.createObjectURL(blob)

        // Create a temporary link and trigger download
        const a = document.createElement('a')
        a.href = url
        a.download = response.headers.get('filename')! // Set filename
        document.body.append(a)
        a.click()
        a.remove()

        // Release URL object
        globalThis.URL.revokeObjectURL(url)
      }
    })}>
      <IconExport />

      {props.label}
    </button>
  )
}

export default ExportButton
