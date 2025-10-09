import { type Component, createSignal, Show } from 'solid-js'

import IconDelete from '@/components/Icons/IconDelete'

const DeleteDialog: Component<{
  title: string
  value: string
  message: string
  enableInput?: boolean
  showLabel?: boolean
  handleDelete: (input: string) => void
}> = (props) => {
  let dialogRef!: HTMLDialogElement
  const [input, setInput] = createSignal('')

  return (
    // reset (parent component uses another text-*) or force text-left
    <div class="inline-block text-left">
      <button class="btn btn-sm bg-red-700 py-0.5" onClick={() => {
        dialogRef.showModal()
        // Reset
        setInput('')
      }}>
        <IconDelete />

        {props.showLabel && 'Delete'}
      </button>

      <dialog class="modal" id="modal_drawer" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">{props.title} <b>"{props.value}"</b></h3>

          <form onSubmit={async (event) => event.preventDefault()  /* Disable page reload after submit */}>
            <div class="m-2">
              <p class="text-sm">{props.message}</p>
            </div>

            <Show when={props.enableInput}>
              <div class="m-2">
                <input class="input w-full" type="text" placeholder={`Type "${props.value}"`} value={input()} onKeyUp={(event) => setInput(event.currentTarget.value.trim())} />
              </div>
            </Show>

            <div class="text-center m-2">
              <button class="btn bg-red-700 py-0.5" type="submit" onClick={() => props.handleDelete(input())} disabled={props.enableInput ? input() !== props.value : false}>
                Delete
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

export default DeleteDialog
