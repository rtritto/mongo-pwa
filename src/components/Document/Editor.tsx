import { type Component, createSignal, Show, Suspense, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike-lite/client/router'

import BackButton from './BackButton'
import SaveButton from './SaveButton'
import DeleteDocument from '@/components/Collection/DeleteDocument'
import CodeEditor from '@/components/common/CodeEditor'
import apiCall from '@/components/common/functions/apiCall'
import isValidInsertDocument from '@/utils/validations/isValidInsertDocument'

const Editor: Component<{
  data: DataDocument
  setData: SetStoreFunction<DataDocument>
}> = (props) => {
  const [code, setCode] = createSignal(untrack(() => props.data.docString))
  const [isCodeValid, setIsCodeValid] = createSignal(true)

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
      <BackButton
        data={props.data}
        setData={props.setData}
        isEqual={() => props.data.docString === code()}
      />

      <Show when={!props.data.options.readOnly}>
        <SaveButton
          data={props.data}
          setData={props.setData}
          disabled={!isCodeValid()}
          code={code()}
          onSave={handleSave}
        />
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
            setIsCodeValid(!isValidInsertDocument(newCode).error)
          }}
          onSave={handleSave}
        />
      </Suspense>

      <Buttons />

      <div class="m-2">
        <DeleteDocument
          data={props.data}
          _id={props.data._id}
          sub_type={props.data.subtype}
          doReload={false}
          setData={props.setData}
          label="Delete"
        />
      </div>
    </div>
  )
}

export default Editor
