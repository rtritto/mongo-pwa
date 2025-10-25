import { type Component, createSignal, Show, untrack } from 'solid-js'

import IconAdd from '@/components/Icons/IconAdd'
import createCodeMirror from '@/components/common/createCodeMirror'
import { toSafeBSON } from '@/utils/bson'

const SaveDialog: Component<{
  title: string
  label: string
  template: string
  message?: string
  handleSave: (doc: string, dialogRef: HTMLDialogElement) => Promise<void>
}> = (props) => {
  let dialogRef!: HTMLDialogElement
  const { editorView, ref: editorRef } = createCodeMirror(untrack(() => props.template))
  const [isTextValid, setIsTextValid] = createSignal(true)

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

            <div
              ref={editorRef}
              onKeyUp={() => {
                setIsTextValid(!!toSafeBSON(editorView()!.state.doc.toString()))
              }}
            />

            <div class="m-2">
              <button
                class="btn bg-green-500 py-0.5"
                type="submit"
                disabled={!isTextValid()}
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
