import { createSignal, onMount, type Component } from 'solid-js'
import { navigate } from 'vike/client/router'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import EditorCodeMirror from './EditorCodeMirror'
import IconBack from '@/components/Icons/IconBack'

const Section_Editor: Component<{ data: DataDocument }> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let hiddenTextarea: HTMLTextAreaElement | undefined

  const [view, setView] = createSignal<any>()

  onMount(() => {
    // Create hidden textarea to use in editor factory
    hiddenTextarea = document.createElement('textarea')
    hiddenTextarea.value = props.data.docString
    containerRef!.append(hiddenTextarea)

    setView(EditorCodeMirror(hiddenTextarea, { readOnly: props.data.readOnly }))
  })

  return (
    <div>
      <div ref={containerRef}>{view()}</div>

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
