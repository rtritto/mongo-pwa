import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import handleFetchError from '@/components/common/functions/handleFetchError'
import IconCompact from '@/components/Icons/IconCompact'
import { HEADERS_JSON } from '@/utils/constants'

const CompactCollectionButton: Component<{
  collection: string
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <button
      class="btn btn-sm w-full bg-red-700 py-0.5"
      type="submit"
      onClick={() => handleFetchError(
        fetch('/api/collectionCompact', {
          method: 'POST',
          body: JSON.stringify({
            database: props.data.selectedDatabase,
            collection: props.collection
          }),
          headers: HEADERS_JSON(props.data.options)
        }),
        props.setData,
        { success: 'Collection compacted!' }
      )}
    >
      <IconCompact />

      Compact
    </button>
  )
}

export default CompactCollectionButton
