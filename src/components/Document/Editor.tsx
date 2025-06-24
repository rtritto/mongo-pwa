import { createSignal, onMount, type Component } from 'solid-js'

import EditorCodeMirror from './EditorCodeMirror'

const Editor: Component<{ docString: string, readOnly: boolean }> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let hiddenTextarea: HTMLTextAreaElement | undefined

  const [view, setView] = createSignal<any>()

  onMount(() => {
    // Create hidden textarea to use in editor factory
    hiddenTextarea = document.createElement('textarea')
    hiddenTextarea.style.display = 'none'
    hiddenTextarea.value = props.docString
    containerRef!.append(hiddenTextarea)

    setView(EditorCodeMirror(hiddenTextarea, { readOnly: props.readOnly }))
  })

  return (
    <div ref={containerRef} class="w-full h-full">{view()}</div>
  )
}

export default Editor
