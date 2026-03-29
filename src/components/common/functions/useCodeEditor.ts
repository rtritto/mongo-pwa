import { highlightText } from '@speed-highlight/core'
import { createSignal, createEffect } from 'solid-js'

export type UseEditorType = ReturnType<typeof useEditor>

export default function useEditor(
  initialValue: () => string,
  readOnly: boolean,
  onChange: (value: string) => void,
  onSave: () => void
) {
  const [html, setHtml] = createSignal('')

  createEffect(() =>
    highlightText(
      initialValue(),
      'js',
      // To avoid issues with text align and scroll,
      // disable multiline to hide line numbers;
      // after manually add line numbers
      false
    )
      .then((highlighted) => {
        setHtml(highlighted)
      })
      .catch(() => {
        // Ignore
      })
  )

  const handleInput = (val: string) => {
    onChange(val)
  }

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    if (readOnly) return

    // Ctrl+Enter / Cmd+Enter Handling
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault() // Prevent new line
      onSave()
      return
    }

    // Tab Handling
    if (e.key === 'Tab') {
      e.preventDefault() // Prevent focus from leaving
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd

      // Shift+Tab and Tab Handling
      if (e.shiftKey) {
        // Remove 2 spaces
        if (ta.value.slice(start - 2, start) === '  ') {
          const val = `${ta.value.slice(0, start - 2)}${ta.value.slice(end)}`
          ta.value = val
          ta.selectionStart = ta.selectionEnd = start - 2
          handleInput(val)
        }
      } else {
        // Insert 2 spaces
        const val = `${ta.value.slice(0, start)}  ${ta.value.slice(end)}`
        ta.value = val
        ta.selectionStart = ta.selectionEnd = start + 2
        handleInput(val)
      }
    }
  }

  return {
    html,
    handleInput,
    handleKeyDown
  }
}
