import { type Component, untrack } from 'solid-js'

import useCodeEditor from './functions/useCodeEditor'

const CodeEditor: Component<{
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}> = (props) => {
  const isReadOnly = untrack(() => props.readOnly!)

  const { html, handleInput, handleKeyDown } = useCodeEditor(
    () => props.value,
    isReadOnly,
    (value) => props.onChange(value)
  )

  let textareaRef!: HTMLTextAreaElement
  let highlightRef!: HTMLPreElement
  let linesRef!: HTMLDivElement

  const syncScroll = () => {
    if (!textareaRef || !highlightRef || !linesRef) return
    highlightRef.scrollTop = textareaRef.scrollTop
    highlightRef.scrollLeft = textareaRef.scrollLeft
    linesRef.scrollTop = textareaRef.scrollTop
  }

  return (
    <div class="flex">
      {/* Column for number rows */}
      <div
        ref={linesRef}
        class="rounded-l-md bg-[#282c34] select-none text-[#636d83] border-r-2 editor-font shj-numbers"
        aria-hidden="true"
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={'<div></div>'.repeat(props.value.split('\n').length)}
      />

      {/* Area Editor */}
      <div class="relative w-full overflow-auto bg-[#282c34] rounded-r-md border border-gray-700 editor-font">
        {/* class="absolute inset-0 overflow-hidden pointer-events-none whitespace-pre shj-lang-js" */}
        <pre ref={highlightRef} class="shj-lang-js">
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <code innerHTML={html()} />
          {/* Prevent scrolling bug on the last line */}
          {'\n'}
        </pre>

        <textarea
          ref={textareaRef}
          value={props.value}
          readOnly={isReadOnly}
          spellcheck={false}
          // class="absolute inset-0 overflow-hidden bg-transparent text-transparent caret-white outline-none resize-none whitespace-pre"
          class="absolute inset-0 text-transparent caret-white outline-none resize-none whitespace-pre editor-font"
          onInput={(e) => handleInput(e.currentTarget.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}

export default CodeEditor
