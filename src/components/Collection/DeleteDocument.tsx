import { type Component, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate, reload } from 'vike/client/router'

import DeleteDialog from '@/components/common/DeleteDialog'
import handleFetchError from '@/components/common/handleFetchError'
import { HEADERS_JSON } from '@/utils/constants'

const DeleteDocument: Component<{
  database: string
  collection: string
  _id: string
  sub_type: number | undefined
  doReload: boolean
  label?: string
  fullWidth?: boolean
  options: Config['options']
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <DeleteDialog
      title="Delete Document"
      message={`Are you sure you want to delete the document?`}
      value={props._id}
      label={props.label}
      fullWidth={props.fullWidth}
      handleDelete={() => handleFetchError(
        fetch('/api/documentDelete', {
          method: 'POST',
          headers: HEADERS_JSON(props.options),
          body: JSON.stringify({
            database: props.database,
            collection: props.collection,
            _id: props._id,
            sub_type: props.sub_type
          })
        }),
        props.setData
      ).then(async (response) => {
        if (response) {
          await (untrack(() => props.doReload)
            ? reload()
            : navigate(`/db/${untrack(() => props.database)}/${untrack(() => props.collection)}`))
        }
      })}
    />
  )
}

export default DeleteDocument
