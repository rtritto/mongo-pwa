import { type Component, createSignal, Show, Suspense, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike-lite/client/router'

import BackButton from './BackButton'
import SaveButton from './SaveButton'
import DeleteDocument from '@/components/Collection/DeleteDocument'
import CodeEditor from '@/components/common/CodeEditor'
import apiCall from '@/components/common/functions/apiCall'
import isValidInsertDocument, { isValidInsertDocumentEntry } from '@/utils/validations/isValidInsertDocument'
import getTopLevelEntries from '@/components/common/functions/getTopLevelEntries'

const Editor: Component<{ data: DataDocument; setData: SetStoreFunction<DataDocument> }> = (props) => {
  const [code, setCode] = createSignal(untrack(() => props.data.docString))
  const [isCodeValid, setIsCodeValid] = createSignal(true)

  // Incremental validation: instead of re-parsing/re-checking the whole
  // document on every keystroke, only the top-level property that changed is
  // re-validated; the (cached) validity of the other properties is reused.
  // Anything that can't be safely mapped to a single property (line added or
  // removed, paste, non-standard formatting) falls back to full validation.
  let previousLines = untrack(() => props.data.docString).split('\n')
  const entryErrors = new Map<string, boolean>()
  let cacheIsPerEntry = false

  const seedFromScratch = (newCode: string): boolean => {
    entryErrors.clear()
    const entries = getTopLevelEntries(newCode)
    if (!entries) {
      cacheIsPerEntry = false
      return !isValidInsertDocument(newCode).error
    }
    for (const entry of entries) entryErrors.set(entry.key, !!isValidInsertDocumentEntry(entry.text).error)
    cacheIsPerEntry = true
    return entryErrors.values().every((hasError) => !hasError)
  }

  const validateChange = (newCode: string): boolean => {
    const newLines = newCode.split('\n')
    const sameLineCount = newLines.length === previousLines.length

    if (!cacheIsPerEntry || !sameLineCount) {
      previousLines = newLines
      return seedFromScratch(newCode)
    }

    let firstChanged = 0
    while (firstChanged < newLines.length && previousLines[firstChanged] === newLines[firstChanged]) firstChanged++
    let lastChanged = newLines.length - 1
    while (lastChanged >= firstChanged && previousLines[lastChanged] === newLines[lastChanged]) lastChanged--
    previousLines = newLines

    if (lastChanged < firstChanged) {
      return entryErrors.values().every((hasError) => !hasError)
    }

    const entries = getTopLevelEntries(newCode)
    if (!entries) return seedFromScratch(newCode)

    const entry = entries.find((e) => firstChanged >= e.startLine && lastChanged <= e.endLine)
    if (!entry) return seedFromScratch(newCode)

    entryErrors.set(entry.key, !!isValidInsertDocumentEntry(entry.text).error)
    return entryErrors.values().every((hasError) => !hasError)
  }

  const handleSave = async () => {
    if (isCodeValid()) {
      const response = await apiCall(
        '/api/documentUpdate',
        {
          database: props.data.selectedDatabase,
          collection: props.data.selectedCollection,
          doc: code(),
          _id: props.data._id,
          sub_type: props.data.subtype
        },
        props.setData
      )
      if (response) {
        const message = `Document "${props.data._id}" updated!`
        await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`)
        props.setData('success', message)
      }
    }
  }

  const Buttons = () => (
    <div class="flex justify-between">
      <BackButton data={props.data} setData={props.setData} isEqual={() => props.data.docString === code()} />

      <Show when={!props.data.options.readOnly}>
        <SaveButton data={props.data} setData={props.setData} disabled={!isCodeValid()} code={code()} onSave={handleSave} />
      </Show>
    </div>
  )

  return (
    <div>
      <Buttons />

      <Suspense>
        <CodeEditor
          value={code()}
          readOnly={props.data.options.readOnly}
          onChange={(newCode) => {
            setCode(newCode)
            setIsCodeValid(validateChange(newCode))
          }}
          onSave={handleSave}
        />
      </Suspense>

      <Buttons />

      <div class="m-2">
        <DeleteDocument data={props.data} _id={props.data._id} sub_type={props.data.subtype} doReload={false} setData={props.setData} label="Delete" />
      </div>
    </div>
  )
}

export default Editor
