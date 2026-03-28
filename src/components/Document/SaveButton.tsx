import { type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import IconSave from '@/components/Icons/IconSave'

const SaveButton: Component<{
  data: DataDocument
  setData: SetStoreFunction<any>
  disabled: boolean
  code: string
  onSave: () => void
}> = (props) => {
  return (
    <button
      class="btn btn-sm bg-green-500 m-1 py-0.5 text-right"
      disabled={props.disabled}
      onClick={() => props.onSave()}
    >
      <IconSave />

      Save
    </button>
  )
}

export default SaveButton
