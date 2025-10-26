import { type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike/client/router'

import type { CustomEditorView } from '@/components/common/createCodeMirror'
import handleFetchError from '@/components/common/handleFetchError'
import IconSave from '@/components/Icons/IconSave'
import { HEADERS_JSON } from '@/utils/constants'

const SaveButton: Component<{
  view: CustomEditorView
  data: DataDocument
  setData: SetStoreFunction<any>
  disabled: boolean
}> = (props) => {
  return (
    <button
      class="btn btn-sm bg-green-500 py-0.5 text-right"
      // TODO always disabled on PROD
      // disabled={props.disabled}
      onClick={async () => {
        const response = await handleFetchError(
          fetch('/api/documentUpdate', {
            method: 'POST',
            headers: HEADERS_JSON(props.data.options),
            body: JSON.stringify({
              database: props.data.selectedDatabase,
              collection: props.data.selectedCollection,
              doc: props.view.state.doc.toString(),
              _id: props.data._id,
              sub_type: props.data.subtype
            })
          }),
          props.setData
        )
        if (response) {
          await response.json() as { insertedId: string }
          localStorage.setItem('me-success', `Document "${props.data._id}" updated!`)
          await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`)
        }
      }}
    >
      <IconSave />

      Save
    </button>
  )
}

export default SaveButton
