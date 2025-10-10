import type { Component } from 'solid-js'
import { reload } from 'vike/client/router'

import DeleteDialog from '@/components/common/DeleteDialog'
import { HEADERS_JSON } from '@/utils/constants'

const DeleteDocument: Component<{
  documentId: string
  database: string
  collection: string
  _id: string
  _subtype: number | undefined
  // setError: (error: string) => void
}> = (props) => {
  return (
    <DeleteDialog
      title="Delete Document"
      value={props._id}
      message={`Are you sure you want to delete the document?`}
      enableInput={false}
      handleDelete={(_input) => {
        fetch('/api/documentDelete', {
          method: 'POST',
          headers: HEADERS_JSON,
          body: JSON.stringify({
            database: props.database,
            collection: props.collection,
            _id: props._id,
            _subtype: props._subtype
          })
        }).then(async (res) => {
          if (res.ok) {
            await reload()
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
