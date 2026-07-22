import { type Component, createSignal, Show, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike-lite/client/router'

import BackButton from './BackButton'
import SaveButton from './SaveButton'
import DeleteDocument from '@/components/Collection/DeleteDocument'
import CodeEditor from '@/components/common/CodeEditor'
import handleFetchError from '@/components/common/functions/handleFetchError'
import { getHeaders } from '@/components/utils/getHeaders'
import isValidInsertDocument from '@/utils/validations/isValidInsertDocument'

const Editor: Component<{
  data: DataDocument
  setData: SetStoreFunction<DataDocument>
}> = (props) => {
  const [code, setCode] = createSignal(untrack(() => props.data.docString))
  const [isCodeValid, setIsCodeValid] = createSignal(true)

  const handleSave = async () => {
    if (isCodeValid()) {
      const response = await handleFetchError(
        fetch('/api/documentUpdate', {
          method: 'POST',
          headers: getHeaders(props.data.options),
          body: JSON.stringify({
            database: props.data.selectedDatabase,
            collection: props.data.selectedCollection,
            doc: code(),
            _id: props.data._id,
            sub_type: props.data.subtype
          })
        }),
        props.setData
      )
      if (response) {
        await response.json() as { insertedId: string }
        localStorage.setItem('me-success', `Document "${props.data._id}" updated!`)
        navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}`)
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

      <CodeEditor
        value={code()}
        readOnly={props.data.options.readOnly}
        onChange={(newCode) => {
          setCode(newCode)
          setIsCodeValid(!isValidInsertDocument(newCode).error)
        }}
        onSave={handleSave}
      />

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
