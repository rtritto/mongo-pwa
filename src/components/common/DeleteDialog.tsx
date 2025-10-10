import { type Component, createSignal, Show, untrack } from 'solid-js'

import IconDelete from '@/components/Icons/IconDelete'

const DeleteDialog: Component<{
  title: string
  value: string
  message: string
  fullWidth?: boolean
  enableInput?: boolean
  showLabel?: boolean
  handleDelete: () => void
}> = (props) => {
  let dialogRef!: HTMLDialogElement
  const [input, setInput] = createSignal('')

  return (
    <div>
      <button class={`btn btn-sm${untrack(() => props.fullWidth) ? ' w-full' : ''} bg-red-700 py-0.5`} onClick={() => {
        dialogRef.showModal()
        // Reset
        setInput('')
      }}>
        <IconDelete />

        {untrack(() => props.showLabel) && 'Delete'}
      </button>

      <dialog class="modal" id="modal_drawer" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">{untrack(() => props.title)} <b>"{untrack(() => props.value)}"</b></h3>

          <form onSubmit={async (event) => event.preventDefault()  /* Disable page reload after submit */}>
            <div class="m-2">
              <p class="text-sm">{untrack(() => props.message)}</p>
            </div>

            <Show when={props.enableInput}>
              <div class="m-2">
                <input class="input w-full" type="text" placeholder={`Type "${untrack(() => props.value)}"`} value={input()} onKeyUp={(event) => setInput(event.currentTarget.value.trim())} />
              </div>
            </Show>

            <div class="m-2">
              <button class="btn bg-red-700 py-0.5" type="submit" onClick={() => props.handleDelete()} disabled={props.enableInput ? input() !== untrack(() => props.value) : false}>
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
