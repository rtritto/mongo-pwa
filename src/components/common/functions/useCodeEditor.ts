import { highlightText } from '@speed-highlight/core'
import { createSignal, createEffect, createMemo } from 'solid-js'

export type UseEditorType = ReturnType<typeof useEditor>

interface Block {
  id: string
  startLine: number
  endLine: number
}

function findBlocks(code: string): Block[] {
  const blocks: Block[] = []
  const stack: number[] = []
  const stackChars: string[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd()
    if (!line) continue

    if (line.endsWith(',') || line.endsWith(';')) {
      line = line.slice(0, -1).trimEnd()
    }

    const lastChar = line[line.length - 1]

    if (lastChar === '{' || lastChar === '[') {
      stack.push(i)
      stackChars.push(lastChar)
    }
    else if (lastChar === '}' || lastChar === ']') {
      const expected = lastChar === '}' ? '{' : '['

      if (stack.length > 0 && stackChars[stackChars.length - 1] === expected) {
        const startLine = stack.pop()!
        stackChars.pop()

        if (i > startLine) {
          blocks.push({
            id: `b${startLine}-${i}`,
            startLine,
            endLine: i,
          })
        }
      }
    }
  }
  return blocks
}

export default function useEditor(
  initialValue: () => string,
  readOnly: boolean,
  onChange: (value: string) => void,
  onSave: () => void
) {
  const [html, setHtml] = createSignal('')
  const [foldedIds, setFoldedIds] = createSignal<Set<string>>(new Set())

  const toggleFold = (id: string) => {
    setFoldedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderData = createMemo(() => {
    const code = initialValue()
    const lines = code.split('\n')
    const blocks = findBlocks(code)

    const lineToBlock = new Map<number, Block>()
    for (const b of blocks) {
      lineToBlock.set(b.startLine, b)
    }

    const displayLines: string[] = []
    const lineNumbers: { original: number; isStart: boolean; isFolded: boolean; blockId?: string }[] = []
    const placeholders = new Map<string, string>()
    const blockToDots = new Map<string, string>()

    let skipUntil = -1
    let foldCounter = 0

    for (let i = 0; i < lines.length; i++) {
      if (i <= skipUntil) continue

      const block = lineToBlock.get(i)
      const isFolded = block ? foldedIds().has(block.id) : false

      if (isFolded && block) {
        const bin = foldCounter.toString(2)
        const invisibleId = bin.split('').map(b => b === '0' ? '\u200B' : '\u200C').join('')

        const magicDots = `...${invisibleId}`
        foldCounter++

        const startLineText = lines[block.startLine]
        const endLineText = lines[block.endLine]

        displayLines.push(startLineText + magicDots + endLineText.trimStart())

        lineNumbers.push({
          original: i + 1,
          isStart: true,
          isFolded: true,
          blockId: block.id
        })

        const hiddenContent = lines.slice(block.startLine + 1, block.endLine).join('\n')
        const leadingSpaces = endLineText.match(/^\s*/)?.[0] || ''

        const replacement = `\n${hiddenContent}\n${leadingSpaces}`
        placeholders.set(magicDots, replacement)
        blockToDots.set(block.id, magicDots)

        skipUntil = block.endLine
      } else {
        displayLines.push(lines[i])
        lineNumbers.push({
          original: i + 1,
          isStart: !!block,
          isFolded: false,
          blockId: block?.id
        })
      }
    }

    return { displayCode: displayLines.join('\n'), lineNumbers, placeholders, blockToDots }
  })

  createEffect(() =>
    highlightText(renderData().displayCode, 'js', false)
      .then(setHtml)
      .catch(() => { })
  )

  const handleInput = (val: string) => {
    let realCode = val
    renderData().placeholders.forEach((replacement, magicDots) => {
      realCode = realCode.split(magicDots).join(replacement)
    })
    onChange(realCode)
  }

  const handleClick = (e: MouseEvent & { currentTarget: HTMLTextAreaElement }) => {
    const ta = e.currentTarget
    const pos = ta.selectionStart

    if (pos !== ta.selectionEnd) return

    const displayCode = renderData().displayCode

    const lineStart = displayCode.lastIndexOf('\n', pos - 1) + 1
    const lineIndex = displayCode.substring(0, pos).split('\n').length - 1

    const lineData = renderData().lineNumbers[lineIndex]

    if (lineData && lineData.isFolded && lineData.blockId) {
      const magicDots = renderData().blockToDots.get(lineData.blockId)

      if (magicDots) {
        const lineText = displayCode.substring(lineStart)
        const dotsIndex = lineText.indexOf(magicDots)

        if (dotsIndex !== -1) {
          const caretCol = pos - lineStart
          if (caretCol >= dotsIndex && caretCol <= dotsIndex + magicDots.length) {
            toggleFold(lineData.blockId)
          }
        }
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
    if (readOnly) return

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSave()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd

      if (e.shiftKey) {
        if (ta.value.slice(start - 2, start) === '  ') {
          const val = `${ta.value.slice(0, start - 2)}${ta.value.slice(end)}`
          ta.value = val
          ta.selectionStart = ta.selectionEnd = start - 2
          handleInput(val)
        }
      } else {
        const val = `${ta.value.slice(0, start)}  ${ta.value.slice(end)}`
        ta.value = val
        ta.selectionStart = ta.selectionEnd = start + 2
        handleInput(val)
      }
    }
  }

  return {
    html,
    handleClick,
    handleInput,
    handleKeyDown,
    renderData,
    toggleFold
  }
}
