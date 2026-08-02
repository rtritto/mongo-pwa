import { highlightText } from '@speed-highlight/core'
import { createSignal, createResource, createMemo, createEffect } from 'solid-js'

interface FoldableRange {
  startLine: number
  endLine: number
  openChar: string
  closeChar: string
}

interface HiddenTextData {
  content: string
  lineIndex: number
}

const escapeHtml = (text: string) =>
  text.replaceAll(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m] as string)

const injectEllipsis = (htmlString: string, hiddenTextMap: Map<string, HiddenTextData>) => {
  let finalHtml = htmlString
  for (const [magicDots, data] of hiddenTextMap) {
    finalHtml = finalHtml.replace(
      magicDots,
      () =>
        `<span class="fold-ellipsis relative z-20 pointer-events-auto cursor-pointer select-none text-[#61afef] transition-colors rounded px-1 py-0.5 hover:bg-[#61afef33] hover:text-[#82c0ff]" data-line="${data.lineIndex}" title="Click to open">…</span>`
    )
  }
  return finalHtml
}

export default function useCodeEditor(
  initialValue: () => string,
  onChange: (value: string) => void,
  onSave: () => void,
  readOnly: true | undefined
) {
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

    const pairs: Record<string, string> = { '}': '{', ']': '[' }

    for (const [i, line] of lines.entries()) {
      let trimmed = line.trimEnd()
      if (trimmed.endsWith(',') || trimmed.endsWith(';')) {
        trimmed = trimmed.slice(0, -1).trimEnd()
      }

      const lastChar = trimmed.at(-1)
      if (lastChar === '{' || lastChar === '[') {
        stack.push({ line: i, char: lastChar })
      } else if (lastChar === '}' || lastChar === ']') {
        const expected = pairs[lastChar]
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].char === expected) {
            const startLine = stack[j].line
            if (i > startLine) {
              ranges.set(startLine, {
                startLine,
                endLine: i,
                openChar: expected,
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
    const hiddenTextMap = new Map<string, HiddenTextData>()
    const foldedSet = foldedLines()

    let skipUntil = -1
    let foldCount = 0

    for (let i = 0; i < lines.length; i++) {
      if (i <= skipUntil) continue

      const range = ranges.get(i)
      const isCollapsed = range && foldedSet.has(i)

      if (isCollapsed) {
        const bin = foldCount.toString(2)
        const invisibleId = [...bin].map((b) => (b === '0' ? '\u{200B}' : '\u{200C}')).join('')
        const magicDots = `…${invisibleId}`
        foldCount++

        const openLine = lines[i]
        const closeLine = lines[range.endLine]
        const lastCharIndex = openLine.lastIndexOf(range.openChar)
        const lineWithoutBracket = openLine.slice(0, Math.max(0, lastCharIndex))

        const collapsedLine = `${lineWithoutBracket}${range.openChar}${magicDots}${closeLine.trimStart()}`
        processedLines.push(collapsedLine)

        lineMapping.push({ number: i + 1, hasRange: true, isCollapsed: true, lineIndex: i })

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
        lineMapping.push({ number: i + 1, hasRange: !!range, isCollapsed: false, lineIndex: i })
      }
    }

    return { displayCode: processedLines.join('\n'), lineMapping, hiddenTextMap }
  })

  const [htmlResource] = createResource(
    renderData,
    async ({ displayCode, hiddenTextMap }) => {
      try {
        const highlighted = await highlightText(displayCode, 'js', false)
        return injectEllipsis(highlighted, hiddenTextMap)
      } catch {
        return injectEllipsis(escapeHtml(displayCode), hiddenTextMap)
      }
    }
  )

  const [highlightedCode, setHighlightedCode] = createSignal<string | undefined>(undefined)

  createEffect(() => {
    const val = htmlResource()
    if (val !== undefined) {
      setHighlightedCode(val)
    }
  })

  const html = () => {
    // 1. ON FIRST RENDER: `highlightedCode` is undefined.
    // By returning `htmlResource()` here directly, we force SolidJS to trigger `<Suspense>`.
    // This entirely prevents the flash of unstyled plain text when the page loads!
    if (highlightedCode() === undefined) {
      const initial = htmlResource()
      if (initial !== undefined) return initial

      // Fallback for TS safety (won't actually paint while Suspending)
      const { displayCode, hiddenTextMap } = renderData()
      return injectEllipsis(escapeHtml(displayCode), hiddenTextMap)
    }

    // 2. WHILE TYPING: We intentionally bypass reading `htmlResource()` directly and
    // only check `.loading`. This prevents Suspense from unmounting the editor (saving focus).
    if (htmlResource.loading) {
      const { displayCode, hiddenTextMap } = renderData()
      return injectEllipsis(escapeHtml(displayCode), hiddenTextMap)
    }

    // 3. IDLE: Return the locally saved highlighted string.
    return highlightedCode()
  }

  const handleInput = (e: Event & { currentTarget: HTMLTextAreaElement }) => {
    const ta = e.currentTarget
    let realCode = ta.value
    for (const [magicDots, data] of renderData().hiddenTextMap.entries()) {
      realCode = realCode.split(magicDots).join(data.content)
    }
    onChange(realCode)
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
      const val = ta.value

      if (e.shiftKey) {
        // Remove 2 spaces
        if (val.slice(start - 2, start) === '  ') {
          ta.setSelectionRange(start - 2, start)
          if (!document.execCommand('delete', false)) {
            ta.value = val.slice(0, start - 2) + val.slice(start)
            ta.selectionStart = ta.selectionEnd = start - 2
            ta.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }
      } else {
        // Insert 2 spaces
        if (!document.execCommand('insertText', false, '  ')) {
          ta.value = val.slice(0, start) + '  ' + val.slice(end)
          ta.selectionStart = ta.selectionEnd = start + 2
          ta.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }
    }
  }

  const handlePreClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('fold-ellipsis')) {
      const lineStr = target.dataset.line
      if (lineStr) toggleFold(Number(lineStr))
    }
  }

  return { html, renderData, handleInput, handleKeyDown, toggleFold, handlePreClick }
}
