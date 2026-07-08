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
        class="editor-font overflow-hidden rounded-l-md border-r-2 border-[#181a1f] bg-[#282c34] py-px text-[#636d83] select-none"
        aria-hidden="true"
      >
        <For each={renderData().lineMapping}>
          {(line) => (
            <div class="flex items-center justify-end pl-2 hover:bg-[#2c313c]">
              <span class="min-w-6 text-right tabular-nums">{line.number}</span>

              <button
                class="flex size-4 cursor-pointer items-center justify-center px-3 py-2.5 text-[10px] transition-colors hover:text-white"
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
      <div class="editor-font relative w-full overflow-auto rounded-r-md border border-[#181a1f] bg-[#282c34]">
        <pre
          ref={highlightRef}
          class="shj-lang-js pointer-events-none relative m-0 bg-transparent"
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
          class="editor-font absolute inset-0 z-10 size-full resize-none bg-transparent whitespace-pre text-transparent caret-white outline-none"
          onInput={(e) => handleInput(e.currentTarget.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
        />

      </div>
    </div>
  )
}

export default CodeEditor
