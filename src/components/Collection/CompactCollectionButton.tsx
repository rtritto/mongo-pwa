import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import apiCall from '@/components/common/functions/apiCall'
import IconCompact from '@/components/Icons/IconCompact'

const CompactCollectionButton: Component<{
  collection: string
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <button class="btn w-full bg-red-700 py-0.5 btn-sm" onClick={() => apiCall(
      '/api/collectionCompact',
      { database: props.data.selectedDatabase, collection: props.collection },
      props.setData,
      { success: 'Collection compacted!' }
    )}>
      <IconCompact /> Compact
    </button>
  )
}

export default CompactCollectionButton
