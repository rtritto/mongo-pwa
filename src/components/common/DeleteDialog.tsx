import { type Component, createSignal } from 'solid-js'

import IconDelete from '@/components/Icons/IconDelete'

const DeleteDialog: Component<{
  title: string
  value: string
  message: string
  handleDelete: (input: string) => void
}> = (props) => {
  let dialogRef!: HTMLDialogElement
  const [input, setInput] = createSignal('')

  return (
    <div>
      <div class="tooltip" data-tip="Delete">
        <button class="btn bg-red-700 py-0.5" onClick={() => {
          dialogRef.showModal()
          // Reset
          setInput('')
        }}>
          <IconDelete />

          Del
        </button>
      </div>

      <dialog id="modal_drawer" class="modal" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">{props.title} <b>"{props.value}"</b></h3>

          <form onSubmit={async (event) => {
            event.preventDefault()  // Disable page reload after submit
          }}>
            <p class="text-sm">{props.message}</p>

            <input type="text" placeholder={`Type "${props.value}"`} class="input m-3 w-full" value={input()} onKeyUp={(event) => {
              setInput(event.currentTarget.value.trim())
            }} />

            <button type="submit" class="btn bg-red-700 py-0.5" onClick={() => {
              props.handleDelete(input())
            }} disabled={input() !== props.value}>
              Delete
            </button>
          </form>
        </div>

        <form method="dialog" class="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  )
}

export default DeleteDialog
