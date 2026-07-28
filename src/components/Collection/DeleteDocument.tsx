import type { Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate, reload } from 'vike-lite/client/router'

import DeleteDialog from '@/components/common/DeleteDialog'
import handleFetchError from '@/components/common/functions/handleFetchError'

const DeleteDocument: Component<{
  data: DataLayout
  setData: SetStoreFunction<any>
  _id: string
  sub_type: number | undefined
  doReload: boolean
  label?: string
  fullWidth?: boolean
}> = (props) => {
  const handleDelete = async () => {
    const response = await handleFetchError(
      '/api/documentDelete',
      JSON.stringify({
        database: props.data.selectedDatabase,
        collection: props.data.selectedCollection,
        _id: props._id,
        sub_type: props.sub_type
      }),
      props.setData
    )
    if (response) {
      await (props.doReload
        ? reload()
        : navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`))
    }
  }
  return (
    <DeleteDialog
      title="Delete Document"
      message={`Are you sure you want to delete the document?`}
      value={props._id}
      label={props.label}
      fullWidth={props.fullWidth}
      handleDelete={handleDelete}
    />
  )
}

export default DeleteDocument
