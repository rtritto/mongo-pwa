import { type Component, untrack, For } from 'solid-js'
import useCodeEditor from './functions/useCodeEditor'

const CodeEditor: Component<{
  value: string
  readOnly: boolean
  onChange: (value: string) => void
  onSave: () => void
}> = (props) => {
  const isReadOnly = untrack(() => props.readOnly)

  const { html, renderData, handleInput, handleKeyDown, toggleFold, handleClick } = useCodeEditor(
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
        class="rounded-l-md bg-[#282c34] select-none text-[#636d83] border-r-2 editor-font overflow-hidden py-[1px]"
        aria-hidden="true"
      >
        <For each={renderData().lineNumbers}>
          {(line) => (
            <div class="flex items-center justify-end px-2 whitespace-pre">
              <span class="mr-2">
                {line.original}
              </span>
              {line.isStart && line.blockId ? (
                <span
                  class="cursor-pointer hover:text-white text-[10px] w-3 text-center flex-shrink-0"
                  onClick={() => toggleFold(line.blockId!)}
                  title={line.isFolded ? "Unfold" : "Fold"}
                >
                  {line.isFolded ? '▶' : '▼'}
                </span>
              ) : (
                <span class="w-3 flex-shrink-0"></span>
              )}
            </div>
          )}
        </For>
        <div>{'\n'}</div>
      </div>

      {/* Area Editor */}
      <div class="relative w-full overflow-auto bg-[#282c34] rounded-r-md border border-gray-700 editor-font">
        <pre ref={highlightRef} class="shj-lang-js">
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <code innerHTML={html()} />
          {'\n'}
        </pre>

        <textarea
          ref={textareaRef}
          value={renderData().displayCode}
          readOnly={isReadOnly}
          spellcheck={false}
          class="absolute inset-0 text-transparent caret-white outline-none resize-none whitespace-pre editor-font"
          onInput={(e) => handleInput(e.currentTarget.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
        />
      </div>
    </div>
  )
}

export default CodeEditor
