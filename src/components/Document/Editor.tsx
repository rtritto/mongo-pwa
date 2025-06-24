import { highlightText } from '@speed-highlight/core'
import { createSignal, onMount, type Component } from 'solid-js'

const Editor: Component<{
  docString: string
  readOnly: boolean
  highlighted: (code: string) => Promise<string>
}> = (props) => {
  const [code, setCode] = createSignal<string>()
  const [codeHighlight, setCodeHighlight] = createSignal<string>()

  const updateCode = async (_code: string) => {
    const _codeHighlight = await highlightText(_code, 'json')
    setCode(_code)
    setCodeHighlight(_codeHighlight)
  }

  onMount(async () => {
    await updateCode(props.docString)
  })

  return (
    <div class="flex">
      <textarea
        id="editing"
        class="textarea shj-lang-js"
        readonly={props.readOnly}
        onInput={(e) => updateCode(e.currentTarget.value)}
      >
        {code()}
      </textarea>

      <div id="highlighting" class="shj-lang-js" innerHTML={codeHighlight()} />
    </ div>
  )
}

export default Editor
