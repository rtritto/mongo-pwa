import { type Component, Show, untrack } from 'solid-js'

import IconAdd from '@/components/Icons/IconAdd'
import createCodeMirror from '@/components/common/createCodeMirror'

const SaveDialog: Component<{
  title: string
  label: string
  template: string
  message?: string
  handleSave: (doc: string, dialogRef: HTMLDialogElement) => Promise<void>
}> = (props) => {
  const { editorView, ref: editorRef } = createCodeMirror(
    untrack(() => props.template),
    { readOnly: false }
  )
  let dialogRef!: HTMLDialogElement

  return (
    <div>
      <button class={`btn btn-sm bg-green-500 py-0.5`} onClick={() => {
        dialogRef.showModal()
        // Reset
        editorView()?.updateDoc(props.template)
      }}>
        <IconAdd />

        {props.label}
      </button>

      <dialog class="modal" id="modal_drawer" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">{props.title}</h3>

          <form onSubmit={(event) => event.preventDefault()  /* Disable page reload after submit */}>
            <Show when={props.message}>
              <div class="m-2">
                <p class="text-sm">{props.message}</p>
              </div>
            </Show>

            <div ref={editorRef} />

            <div class="m-2">
              <button
                class="btn bg-green-500 py-0.5"
                type="submit"
                onClick={async () => (
                  await props.handleSave(editorView()!.state.doc.toString(), dialogRef)
                )}
              >
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

export default SaveDialog
