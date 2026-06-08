import { type Component, untrack, For } from 'solid-js'
import useCodeEditor from './functions/useCodeEditor'

const CodeEditor: Component<{
  value: string
  readOnly: boolean
  onChange: (value: string) => void
  onSave: () => void
}> = (props) => {
  const isReadOnly = untrack(() => props.readOnly)

  const { html, renderData, handleInput, handleKeyDown, toggleFold, handlePreClick } = useCodeEditor(
    () => props.value,
    isReadOnly,
    (value) => props.onChange(value),
    () => props.onSave()
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
        class="rounded-l-md bg-[#282c34] select-none text-[#636d83] border-r-2 border-[#181a1f] py-px editor-font overflow-hidden"
        aria-hidden="true"
      >
        <For each={renderData().lineMapping}>
          {(line) => (
            <div class="flex items-center justify-end px-2 hover:bg-[#2c313c] min-h-[1.5em]">
              <span class="text-right tabular-nums min-w-5">{line.number}</span>

              <button
                class="w-4 h-4 flex items-center justify-center text-[10px] py-2.5 px-3 hover:text-white transition-colors cursor-pointer"
                style={{ visibility: line.hasRange ? 'visible' : 'hidden' }}
                onClick={() => toggleFold(line.lineIndex)}
                type="button"
                aria-label={line.isCollapsed ? 'Expand' : 'Collapse'}
              >
                {line.isCollapsed ? '›' : '⌄'}
              </button>
            </div>
          )}
        </For>

        {/* Prevent scrolling bug on the last line */}
        <div>{'\n'}</div>
      </div>

      {/* Area Editor */}
      {/* class="absolute inset-0 overflow-hidden pointer-events-none whitespace-pre shj-lang-js" */}
      <div class="relative w-full overflow-auto bg-[#282c34] rounded-r-md border border-[#181a1f] editor-font">
        <pre
          ref={highlightRef}
          class="relative pointer-events-none bg-transparent shj-lang-js m-0"
          onClick={handlePreClick}
        >
          <code innerHTML={html()} />
          {'\n'}
        </pre>

        <textarea
          ref={textareaRef}
          value={renderData().displayCode}
          readOnly={isReadOnly}
          spellcheck={false}
          // class="absolute inset-0 overflow-hidden bg-transparent text-transparent caret-white outline-none resize-none whitespace-pre"
          class="absolute inset-0 z-10 w-full h-full bg-transparent text-transparent caret-white outline-none resize-none whitespace-pre editor-font"
          onInput={(e) => handleInput(e.currentTarget.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
        />

      </div>
    </div>
  )
}

export default CodeEditor
