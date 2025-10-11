import { type Component, createSignal, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Editor from '@/components/Document/Editor'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  const [idDocumentUpdated, setIdDocumentUpdated] = createSignal('')
  return (
    <>
      <h1>{data.title}</h1>

      <Show when={idDocumentUpdated()}>
        <div role="alert" class="alert alert-success alert-outline mb-2">
          <span>Document "<b>{idDocumentUpdated()}</b>" updated!</span>
        </div>
      </Show>

      <Editor data={data} setDocumentUpdated={setIdDocumentUpdated} />
    </>
  )
}

export default Page
