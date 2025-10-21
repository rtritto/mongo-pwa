import { type Component, createSignal } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike/client/router'

import IconBack from '@/components/Icons/IconBack'
import type { CustomEditorView } from '@/components/common/createCodeMirror'

const BackButton: Component<{
  view: CustomEditorView
  data: DataDocument
  setData: SetStoreFunction<any>
}> = (props) => {
  const [buttonText, setButtonText] = createSignal('Back')
  const [discardChanges, setDiscardChanges] = createSignal(false)

  return (
    <button class="btn btn-sm bg-yellow-500 py-0.5 text-right" onClick={async () => {
      if (props.view.isClean() || discardChanges()) {
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
