import { createSignal, onMount, type Component } from 'solid-js'

import EditorCodeMirror from './EditorCodeMirror'

const Section_Editor: Component<{ docString: string, readOnly: boolean }> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let hiddenTextarea: HTMLTextAreaElement | undefined

  const [view, setView] = createSignal<any>()

  onMount(() => {
    // Create hidden textarea to use in editor factory
    hiddenTextarea = document.createElement('textarea')
    hiddenTextarea.value = props.docString
    containerRef!.append(hiddenTextarea)

    setView(EditorCodeMirror(hiddenTextarea, { readOnly: props.readOnly }))
  })

  return (
    <div ref={containerRef}>{view()}</div>
  )
}

export default Section_Editor
