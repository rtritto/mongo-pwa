import { type Component, createSignal } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike-lite/client/router'

import IconBack from '@/components/Icons/IconBack'

const BackButton: Component<{
  data: DataDocument
  setData: SetStoreFunction<DataDocument>
  isEqual: () => boolean
}> = (props) => {
  const [buttonText, setButtonText] = createSignal('Back')
  const [discardChanges, setDiscardChanges] = createSignal(false)

  return (
    <button class="btn m-1 bg-yellow-500 py-0.5 text-right btn-sm" onClick={async () => {
      if (props.isEqual() || discardChanges()) {
        await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`)
      } else {
        setButtonText('Discard & Back')
        setDiscardChanges(true)
        props.setData('warning', 'Document has changed! Do you want to go back?')
      }
    }}>
      <IconBack />

      {buttonText()}
    </button>
  )
}

export default BackButton
