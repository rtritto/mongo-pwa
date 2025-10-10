import { basicSetup } from 'codemirror'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { createEffect, createSignal, on, onCleanup, onMount } from 'solid-js'

const customHighlightStyle = HighlightStyle.define([
  {
    tag: [t.labelName],
    color: '#e06c75'
  }
])
const customOneDark = [
  oneDarkTheme,
  syntaxHighlighting(customHighlightStyle),
  syntaxHighlighting(oneDarkHighlightStyle)
]

/**
 * @description Create a CodeMirror editor instance
 * @link https://github.com/riccardoperra/solid-codemirror/blob/main/src/core/createCodeMirror.ts
 */
const createCodeMirror = (doc: string, options: { readOnly: boolean }) => {
  const [ref, setRef] = createSignal<HTMLElement>()
  const [editorView, setEditorView] = createSignal<EditorView>()

  createEffect(
    on(ref, (ref) => {
      const state = EditorState.create({
        doc,
        extensions: [
          basicSetup,
          history(),
          lineNumbers(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          javascript(),
          indentUnit.of(' '),
          EditorState.readOnly.of(options.readOnly),
          customOneDark
        ]
      })

      const view = new EditorView({
        state,
        parent: ref
      }) as EditorView & { isClean: () => boolean }

      // Method "isClean" was removed in CodeMirror 6
      // See https://discuss.codemirror.net/t/is-dirty-flag-available-in-codemirror/2716
      view.isClean = () => state.doc.eq(view.state.doc)

      onMount(() => setEditorView(view))

      onCleanup(() => {
        editorView()?.destroy()
        setEditorView(undefined)
      })
    })
  )
  return {
    editorView,
    ref: setRef
  } as const
}

export default createCodeMirror
