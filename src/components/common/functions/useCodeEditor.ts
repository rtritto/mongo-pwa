import { highlightText } from '@speed-highlight/core'
import { createSignal, createEffect } from 'solid-js'

export type UseEditorType = ReturnType<typeof useEditor>

export default function useEditor(initialValue: () => string, readOnly: boolean, onChange?: (value: string) => void) {
  const [html, setHtml] = createSignal('')

  createEffect(() =>
    // To avoid issues with text align and scroll,
    // disable multiline to hide line numbers;
    // after it's added manually
    highlightText(initialValue(), 'js', false)
      .then((highlighted) => {
        setHtml(highlighted)
      })
  )

  const handleInput = (val: string) => {
    if (onChange) onChange(val)
  }

  // Advanced Tab Key Handling (Shift+Tab and Tab)
  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    if (e.key === 'Tab') {
      e.preventDefault() // Prevent focus from leaving
      if (readOnly) return

      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd

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
