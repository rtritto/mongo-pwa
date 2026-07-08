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
      class="btn m-1 bg-green-500 py-0.5 text-right btn-sm"
      disabled={props.disabled}
      onClick={() => props.onSave()}
    >
      <IconSave />

      Save
    </button>
  )
}

export default SaveButton
