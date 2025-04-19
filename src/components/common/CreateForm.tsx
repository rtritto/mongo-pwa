import { createSignal, type Component } from 'solid-js'

import IconAdd from '@/components/Icons/IconAdd'

const CreateForm: Component<{
  entity: string
  isValidInput: (input: string) => { error?: string }
  onButtonClick: (input: string) => Promise<void>
}> = (props) => {
  const [input, setInput] = createSignal('')
  const [invalidMessage, setInvalidMessage] = createSignal()

  return (
    <form>
      <input
        class="input mx-0.5"
        type="text"
        placeholder={`${props.entity} Name`}
        value={input()}
        onKeyUp={(event) => {
          setInput(event.currentTarget.value.trim())
          if (input().length > 0) {
            setInvalidMessage(props.isValidInput(input()).error)
          }
        }}
      />

      <button
        class={`btn bg-blue-700 mx-0.5${invalidMessage() ? ' input-error' : ''}`}
        type="submit"
        onClick={async (e) => {
          e.preventDefault()
          await props.onButtonClick(input())
          setInput('')  // Reset value
        }}
        disabled={!!invalidMessage()}
      >
        <IconAdd />

        Create {props.entity}
      </button>
    </form>
  )
}

export default CreateForm
