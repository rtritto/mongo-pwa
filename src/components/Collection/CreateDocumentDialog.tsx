import { type Component, untrack } from 'solid-js'
import { reload } from 'vike/client/router'

import IconAdd from '@/components/Icons/IconAdd'
import createCodeMirror from '@/components/Document/createCodeMirror'
import { HEADERS_JSON } from '@/utils/constants'

const docStringTemplate = `{
  _id: ObjectId()
}`

const AddDocumentDialog: Component<{
  database: string
  collection: string
  setIdDocumentCreated: (value: string) => void
}> = (props) => {
  const { editorView, ref: editorRef } = createCodeMirror(
    docStringTemplate,
    { readOnly: false }
  )
  let dialogRef!: HTMLDialogElement

  return (
    <div>
      <button class={`btn btn-sm w-full bg-green-500 py-0.5`} onClick={() => {
        dialogRef.showModal()
        // Reset
        editorView()?.updateDoc(docStringTemplate)
      }}>
        <IconAdd />

        New Document
      </button>

      <dialog class="modal" id="modal_drawer" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">Add Document</h3>

          <form onSubmit={async (event) => event.preventDefault()  /* Disable page reload after submit */}>
            <div ref={editorRef} />

            <div class="m-2">
              <button class="btn bg-green-500 py-0.5" type="submit" onClick={async () => (
                fetch('/api/documentCreate', {
                  method: 'POST',
                  headers: HEADERS_JSON,
                  body: JSON.stringify({
                    database: props.database,
                    collection: props.collection,
                    doc: editorView()?.state.doc.toString()
                  })
                }).then(async (res) => {
                  if (res.ok) {
                    const { insertedId } = await res.json() as { insertedId: string }
                    reload()
                    // TODO
                    untrack(() => props.setIdDocumentCreated(insertedId))
                  } else {
                    // const { error } = await res.json()
                    // setError(error)
                  }
                })
                // .catch((error) => { setError(error.message) })
              )}>
                Save
              </button>
            </div>
          </form>
        </div>

        <form class="modal-backdrop" method="dialog">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  )
}

export default AddDocumentDialog
