import { type Component, createSignal, Show, untrack } from 'solid-js'

import IconAdd from '@/components/Icons/IconAdd'
import CodeEditor from '@/components/common/CodeEditor'
import isValidInsertDocument from '@/utils/validations/isValidInsertDocument'

const SaveDialog: Component<{
  title: string
  label: string
  template: string
  message?: string
  handleSave: (doc: string, dialogRef: HTMLDialogElement) => Promise<void>
}> = (props) => {
  let dialogRef!: HTMLDialogElement
  const template = untrack(() => props.template)
  const [code, setCode] = createSignal(template)

  return (
    <div>
      <button class={`btn btn-sm bg-green-500 py-0.5`} onClick={() => {
        dialogRef.showModal()
        // Reset
        setCode(template)
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

            <CodeEditor
              value={code()}
              readOnly={false}
              onChange={(newCode) => setCode(newCode)}
            />

            <div class="m-2">
              <button
                class="btn bg-green-500 py-0.5"
                type="submit"
                disabled={!!isValidInsertDocument(code()).error}
                onClick={async () => await props.handleSave(code(), dialogRef)}
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
