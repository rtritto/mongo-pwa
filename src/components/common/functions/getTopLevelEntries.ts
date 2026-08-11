export interface TopLevelEntry {
  key: string
  text: string
  startLine: number
  endLine: number
}

// Same simplified bracket heuristic already used by useCodeEditor.ts for folding:
// the document text is always pretty-printed, so a line's *last* meaningful
// character tells us whether it opens or closes a block.
const getLineDelta = (line: string): number => {
  let trimmed = line.trimEnd()
  if (trimmed.endsWith(',') || trimmed.endsWith(';')) trimmed = trimmed.slice(0, -1).trimEnd()
  const lastChar = trimmed.at(-1)
  if (lastChar === '{' || lastChar === '[') return 1
  if (lastChar === '}' || lastChar === ']') return -1
  return 0
}

const KEY_RE = /^\s*(?:(['"])((?:(?!\1)[^\\]|\\.)*)\1|([$\w][\w$]*))\s*:/

const getEntryKeyName = (entryText: string, fallbackIndex: number): string => {
  const match = entryText.match(KEY_RE)
  return match?.[2] ?? match?.[3] ?? `__entry_${fallbackIndex}__`
}

/**
 * Splits a pretty-printed document body into its top-level ("depth === 1")
 * property blocks, so callers can re-validate a single edited property
 * instead of the whole document.
 *
 * Returns `null` when the document isn't a single balanced root object/array
 * (e.g. mid-edit with a missing brace, or unusual formatting) — callers
 * should fall back to validating the whole text in that case.
 */
export default function getTopLevelEntries(text: string): TopLevelEntry[] | null {
  const lines = text.split('\n')
  let depth = 0
  const entries: TopLevelEntry[] = []
  let i = 0
  while (i < lines.length) {
    const depthBefore = depth
    const delta = getLineDelta(lines[i])
    if (depthBefore === 1 && delta !== -1) {
      const startLine = i
      depth += delta
      let j = i
      while (depth > 1) {
        j++
        if (j >= lines.length) return null
        depth += getLineDelta(lines[j])
      }
      const entryText = lines.slice(startLine, j + 1).join('\n')
      entries.push({ key: getEntryKeyName(entryText, entries.length), text: entryText, startLine, endLine: j })
      i = j + 1
      continue
    }
    depth += delta
    i++
  }
  return depth === 0 ? entries : null
}
