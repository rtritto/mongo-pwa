import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import apiCall from '@/components/common/functions/apiCall'
import IconExport from '@/components/Icons/IconExport'

const ExportCollectionButton: Component<{
  label: string
  url: '/api/collectionExport' | '/api/collectionExportCsv'
  collection: string
  query: QueryParameter
  data: DataDB | DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <button class="btn w-full bg-yellow-600 btn-sm" onClick={async () => {
      const response = await apiCall(
        props.url,
        {
          query: props.query,
          database: props.data.selectedDatabase,
          collection: props.collection
        },
        props.setData
      )
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
    }}>
      <IconExport />

      {props.label}
    </button>
  )
}

export default ExportCollectionButton
