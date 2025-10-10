import { untrack, type Component } from 'solid-js'
import { navigate, reload } from 'vike/client/router'

import DeleteDialog from '@/components/common/DeleteDialog'
import { HEADERS_JSON } from '@/utils/constants'

const DeleteDocument: Component<{
  database: string
  collection: string
  _id: string
  sub_type: number | undefined
  doReload: boolean
  showLabel?: boolean
  // setError: (error: string) => void
}> = (props) => {
  return (
    <DeleteDialog
      title="Delete Document"
      value={props._id}
      message={`Are you sure you want to delete the document?`}
      showLabel={props.showLabel}
      enableInput={false}
      handleDelete={() => {
        fetch('/api/documentDelete', {
          method: 'POST',
          headers: HEADERS_JSON,
          body: JSON.stringify({
            database: props.database,
            collection: props.collection,
            _id: props._id,
            sub_type: props.sub_type
          })
        }).then(async (res) => {
          if (res.ok) {
            await (untrack(() => props.doReload)
              ? reload()
              : navigate(`/db/${untrack(() => props.database)}/${untrack(() => props.collection)}`))
          } else {
            // const { error } = await res.json()
            // setError(error)
          }
        })
        // .catch((error) => { setError(error.message) })
      }}
    />
  )
}

export default DeleteDocument
