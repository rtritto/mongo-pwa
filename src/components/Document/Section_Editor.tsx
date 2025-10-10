import { type Component, untrack } from 'solid-js'
import { navigate } from 'vike/client/router'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import createCodeMirror from './createCodeMirror'
import IconBack from '@/components/Icons/IconBack'

const Section_Editor: Component<{ data: DataDocument }> = (props) => {
  const { editorView, ref: editorRef } = createCodeMirror(untrack(() => props.data.docString), { readOnly: untrack(() => props.data.readOnly) })

  return (
    <div>
      <div ref={editorRef} />

      <div class="m-2">
        <button class="btn btn-sm bg-yellow-500 py-0.5 text-right" onClick={async () => {
          await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`)
        }}>
          <IconBack />

          Back
        </button>
      </div>

      <div class="m-2">
        <DeleteDocument
          database={props.data.selectedDatabase}
          collection={props.data.selectedCollection}
          _id={props.data._id}
          sub_type={props.data.subtype}
          doReload={false}
          showLabel={true}
        />
      </div>
    </div>
  )
}

export default Section_Editor
