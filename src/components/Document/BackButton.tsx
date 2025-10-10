import { type Component, createSignal } from 'solid-js'
import { navigate } from 'vike/client/router'

import IconBack from '@/components/Icons/IconBack'
import type { CustomEditorView } from './createCodeMirror'

const BackButton: Component<{
  view: CustomEditorView
  data: DataDocument
  setShowBanner: (value: boolean) => void
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
        props.setShowBanner(true)
      }
    }}>
      <IconBack />

      {buttonText()}
    </button>
  )
}

export default BackButton
