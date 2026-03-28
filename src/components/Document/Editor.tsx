import { type Component, createSignal, untrack } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import BackButton from './BackButton'
import SaveButton from './SaveButton'
import CodeEditor from '@/components/common/CodeEditor'
import isValidInsertDocument from '@/utils/validations/isValidInsertDocument'

const Editor: Component<{
  data: DataDocument
  setData: SetStoreFunction<DataDocument>
}> = (props) => {
  const [code, setCode] = createSignal(untrack(() => props.data.docString))
  const [isValid, setIsValid] = createSignal(true)

  const handleChange = (newCode: string) => {
    setCode(newCode)
    setIsValid(!isValidInsertDocument(newCode).error)
  }

  const Buttons = () => (
    <div class="flex justify-between">
      <BackButton data={props.data} setData={props.setData} isEqual={() => props.data.docString === code()} />

      <SaveButton data={props.data} setData={props.setData} disabled={!isValid()} code={code()} />
    </div>
  )

  return (
    <div>
      <Buttons />

      <CodeEditor value={code()} readOnly={untrack(() => props.data.readOnly)} onChange={handleChange} />

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
