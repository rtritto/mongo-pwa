import { type Component, createSignal, Show, untrack } from 'solid-js'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import createCodeMirror from '@/components/common/createCodeMirror'
import BackButton from './BackButton'
import SaveButton from './SaveButton'

const Editor: Component<{
  data: DataDocument
  setIdDocumentUpdated: (id: string) => void
}> = (props) => {
  const [showBanner, setShowBanner] = createSignal(false)
  const { editorView, ref: editorRef } = createCodeMirror(
    untrack(() => props.data.docString),
    { readOnly: untrack(() => props.data.readOnly) }
  )

  return (
    <div>
      <Show when={showBanner()}>
        <div role="alert" class="alert alert-warning alert-outline mb-2">
          <span>Document has changed! Do you want to go back?</span>
        </div>
      </Show>

      <div ref={editorRef} />

      <BackButton view={editorView()!} data={props.data} setShowBanner={setShowBanner} />

      <SaveButton view={editorView()!} data={props.data} setIdDocumentUpdated={props.setIdDocumentUpdated} />

      <div class="m-2">
        <DeleteDocument
          database={props.data.selectedDatabase}
          collection={props.data.selectedCollection}
          _id={props.data._id}
          sub_type={props.data.subtype}
          doReload={false}
          label="Delete"
        />
      </div>
    </div>
  )
}

export default Editor
