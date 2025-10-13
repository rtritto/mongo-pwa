import { type Component, type JSX, createSignal, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Editor from '@/components/Document/Editor'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  const [alertSuccessMessage, setAlertSuccessMessage] = createSignal<JSX.Element>()
  return (
    <>
      <h1>{data.title}</h1>

      <Show when={alertSuccessMessage()}>
        <div role="alert" class="alert alert-success alert-outline mb-2">
          {alertSuccessMessage()}
        </div>
      </Show>

      <Editor data={data} setAlertSuccessMessage={setAlertSuccessMessage} />
    </>
  )
}

export default Page
