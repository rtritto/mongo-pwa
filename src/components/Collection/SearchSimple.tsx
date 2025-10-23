import { createSignal, For, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import IconSearch from '@/components/Icons/IconSearch'

const SELECT_VALUES = {
  'ObjectId': 'O',
  'UUID': 'U',
  'Number': 'N',
  'String': 'S',
  'Boolean': 'B',
  'Regex': 'R',
  'JSON': 'J'
}

const SearchSimple: Component<{
  data: DataCollection
}> = (props) => {
  let buttonRef: HTMLButtonElement | undefined
  const [inputKey, setInputKey] = createSignal('')
  const [inputValue, setInputValue] = createSignal('')
  const [selectValue, setSelectValue] = createSignal<keyof typeof SELECT_VALUES>('ObjectId')

  return (
    <div class="flex flex-row gap-2">
      <input
        // TODO add validation for key
        type="text"
        placeholder="Key"
        class="input"
        value={inputKey()}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            buttonRef!.click()
          } else {
            setInputKey(event.currentTarget.value.trim())
          }
        }}
      />

      <input
        type="text"
        placeholder="Value"
        class="input"
        value={inputValue()}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            buttonRef!.click()
          } else {
            setInputValue(event.currentTarget.value.trim())
          }
        }}
      />

      <select
        class="select list"
        value={selectValue()}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            buttonRef!.click()
          }
        }}
        onChange={(event) => setSelectValue(event.currentTarget.value as keyof typeof SELECT_VALUES)}
      >
        <For each={Object.keys(SELECT_VALUES)}>
          {(value) => <option value={value}>{value}</option>}
        </For>
      </select>

      <button
        class="btn bg-blue-500"
        disabled={!inputKey() || !inputValue()}
        ref={buttonRef}
        onClick={async () => {
          await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}?key=${encodeURIComponent(inputKey())}&value=${encodeURIComponent(inputValue())}&type=${SELECT_VALUES[selectValue()]}`)
        }}
      >
        <IconSearch />

        Search
      </button>
    </div>
  )
}

export default SearchSimple
