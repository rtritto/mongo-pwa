import { type Component, type JSX, untrack } from 'solid-js'
import { navigate } from 'vike/client/router'

import IconSave from '@/components/Icons/IconSave'
import type { CustomEditorView } from '@/components/common/createCodeMirror'
import { HEADERS_JSON } from '@/utils/constants'

const SaveButton: Component<{
  view: CustomEditorView
  data: DataDocument
  setAlertSuccessMessage: (message: JSX.Element) => void
}> = (props) => {
  return (
    <button class="btn btn-sm bg-green-500 py-0.5 text-right" onClick={() => (
      fetch('/api/documentUpdate', {
        method: 'POST',
        headers: HEADERS_JSON,
        body: JSON.stringify({
          database: props.data.selectedDatabase,
          collection: props.data.selectedCollection,
          doc: props.view.state.doc.toString(),
          _id: props.data._id,
          sub_type: props.data.subtype
        })
      }).then(async (res) => {
        if (res.ok) {
          const { insertedId } = await res.json() as { insertedId: string }
          navigate(`/db/${untrack(() => props.data.selectedDatabase)}/${untrack(() => props.data.selectedCollection)}`)
          untrack(() => props.setAlertSuccessMessage(<span>Document "<b>{insertedId}</b>" updated!</span>))
        } else {
          // const { error } = await res.json()
          // setError(error)
        }
      })
      // .catch((error) => { setError(error.message) })
    )}>
      <IconSave />

      Save
    </button>
  )
}

export default SaveButton
