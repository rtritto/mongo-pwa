import { highlightText } from '@speed-highlight/core'
import { createSignal, onMount, type Component } from 'solid-js'

const CodeHighlighter: Component<{
  docString: string
  readOnly: boolean
  highlighted: (code: string) => Promise<string>
}> = (props) => {
  const [code, setCode] = createSignal<string>()
  const [codeHighlight, setCodeHighlight] = createSignal<string>()

  onMount(async () => {
    const _codeHighlight = await highlightText(props.docString, 'json')
    setCode(props.docString)
    setCodeHighlight(_codeHighlight)
  })

  return (
    <div class="flex">
      <textarea
        id="editing"
        class="textarea shj-lang-js z-1"
        readonly={props.readOnly}
        onInput={(e) => {
          highlightText(e.currentTarget.value, 'json').then((_codeHighlight) => {
            setCode(e.currentTarget.value)
            setCodeHighlight(_codeHighlight)
          })
        }}
      >
        {code()}
      </textarea>

      <div id="highlighting" class="shj-lang-js z-0" innerHTML={codeHighlight()} />
    </ div>
  )
}

export default CodeHighlighter
