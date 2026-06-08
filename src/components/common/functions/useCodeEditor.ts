import { highlightText } from '@speed-highlight/core'
import { createSignal, createEffect, createMemo } from 'solid-js'

export type UseEditorType = ReturnType<typeof useEditor>

interface FoldableRange {
  startLine: number
  endLine: number
  openChar: string
  closeChar: string
}

export default function useEditor(
  initialValue: () => string,
  readOnly: boolean,
  onChange: (value: string) => void,
  onSave: () => void
) {
  const [html, setHtml] = createSignal('')
  const [foldedLines, setFoldedLines] = createSignal<Set<number>>(new Set())

  const toggleFold = (lineNumber: number) => {
    setFoldedLines((prev) => {
      const next = new Set(prev)
      if (next.has(lineNumber)) next.delete(lineNumber)
      else next.add(lineNumber)
      return next
    })
  }

  const renderData = createMemo(() => {
    const text = initialValue()
    const lines = text.split('\n')
    const ranges = new Map<number, FoldableRange>()
    const stack: { line: number; char: string }[] = []

    for (const [lineIndex, line] of lines.entries()) {
      let trimmed = line.trimEnd()
      if (trimmed.endsWith(',') || trimmed.endsWith(';')) {
        trimmed = trimmed.slice(0, -1).trimEnd()
      }

      const lastChar = trimmed.at(-1)

      if (lastChar === '{' || lastChar === '[') {
        stack.push({ line: lineIndex, char: lastChar })
      } else if (lastChar === '}' || lastChar === ']') {
        const expected = lastChar === '}' ? '{' : '['

        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].char === expected) {
            const startLine = stack[j].line
            if (lineIndex > startLine) {
              ranges.set(startLine, {
                startLine,
                endLine: lineIndex,
                openChar: stack[j].char,
                closeChar: lastChar
              })
            }
            stack.splice(j, 1)
            break
          }
        }
      }
    }

    const processedLines: string[] = []
    const lineMapping = []
    // Save the textual content and the line for the click
    const hiddenTextMap = new Map<string, { content: string, lineIndex: number }>()
    const foldedSet = foldedLines()
    let skipUntil = -1
    let foldCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (i <= skipUntil) continue

      const range = ranges.get(i)
      const isCollapsed = range && foldedSet.has(i)

      if (isCollapsed) {
        const bin = foldCount.toString(2)
        const invisibleId = [...bin].map(b => b === '0' ? '\u200B' : '\u200C').join('')
        const magicDots = `…${invisibleId}`
        foldCount++

        const openLine = lines[i]
        const closeLine = lines[range.endLine]
        const lastCharIndex = openLine.lastIndexOf(range.openChar)
        const lineWithoutBracket = openLine.slice(0, Math.max(0, lastCharIndex))

        const collapsedLine = `${lineWithoutBracket}${range.openChar}${magicDots}${closeLine.trimStart()}`
        processedLines.push(collapsedLine)

        lineMapping.push({
          number: i + 1,
          hasRange: true,
          isCollapsed: true,
          lineIndex: i
        })

        const hiddenContent = lines.slice(i + 1, range.endLine).join('\n')
        const leadingSpaces = closeLine.match(/^\s*/)?.[0] || ''

        // Save the textual content and the line for the click
        hiddenTextMap.set(magicDots, {
          content: `\n${hiddenContent}\n${leadingSpaces}`,
          lineIndex: i
        })

        skipUntil = range.endLine
      } else {
        processedLines.push(lines[i])
        lineMapping.push({
          number: i + 1,
          hasRange: !!range,
          isCollapsed: false,
          lineIndex: i
        })
      }
    }

    return {
      displayCode: processedLines.join('\n'),
      lineMapping,
      hiddenTextMap
    }
  })

  createEffect(() => {
    const { displayCode } = renderData()
    // To avoid issues with text align and scroll:
    // 1. Disable multiline to hide line numbers
    highlightText(displayCode, 'js', false)
      // 2. After manually add line numbers
      .then((highlighted) => {
        let finalHtml = highlighted
        for (const [magicDots, data] of renderData().hiddenTextMap.entries()) {
          const span = `<span class="fold-ellipsis relative z-20 pointer-events-auto cursor-pointer select-none text-[#61afef] transition-colors rounded px-1 py-0.5 hover:bg-[#61afef33] hover:text-[#82c0ff]" data-line="${data.lineIndex}" title="Click to open">…</span>`
          finalHtml = finalHtml.replace(magicDots, span)
        }
        setHtml(finalHtml)
      })
      .catch(() => { })
  })

  const handleInput = (val: string) => {
    let realCode = val
    for (const [magicDots, data] of renderData().hiddenTextMap.entries()) {
      realCode = realCode.split(magicDots).join(data.content)
    }
    onChange(realCode)
  }

  const handlePreClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('fold-ellipsis')) {
      const lineStr = target.dataset.line
      if (lineStr) {
        toggleFold(Number(lineStr))
      }
    }
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
    renderData,
    handleInput,
    handleKeyDown,
    toggleFold,
    handlePreClick
  }
}
