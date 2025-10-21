import { type Component, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import createCodeMirror from '@/components/common/createCodeMirror'
import BackButton from './BackButton'
import SaveButton from './SaveButton'

const Editor: Component<{
  data: DataDocument
  setData: SetStoreFunction<any>
}> = (props) => {
  const { editorView, ref: editorRef } = createCodeMirror(
    untrack(() => props.data.docString),
    { readOnly: untrack(() => props.data.readOnly) }
  )

  return (
    <div>
      <div ref={editorRef} />

      <BackButton view={editorView()!} data={props.data} setData={props.setData} />

      <SaveButton view={editorView()!} data={props.data} setData={props.setData} />

      <div class="m-2">
        <DeleteDocument
          data={props.data}
          _id={props.data._id}
          sub_type={props.data.subtype}
          doReload={false}
          setData={props.setData}
          label="Delete"
        />
      </div>
    </div>
  )
}

export default Editor
