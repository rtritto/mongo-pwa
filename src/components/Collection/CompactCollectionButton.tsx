import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import handleFetchError from '@/components/common/functions/handleFetchError'
import IconCompact from '@/components/Icons/IconCompact'
import { HEADERS } from '@/components/utils/getHeaders'

const CompactCollectionButton: Component<{
  collection: string
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <button
      class="btn w-full bg-red-700 py-0.5 btn-sm"
      type="submit"
      onClick={() => handleFetchError(
        fetch('/api/collectionCompact', {
          method: 'POST',
          body: JSON.stringify({
            database: props.data.selectedDatabase,
            collection: props.collection
          }),
          headers: HEADERS
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
