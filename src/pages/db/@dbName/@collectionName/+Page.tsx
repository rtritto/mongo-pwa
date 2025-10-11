import { type Component, createSignal, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Section_DocumentList from '@/components/Collection/Section_DocumentList'
import StatsTable from '@/components/common/StatsTable'
import CreateDocumentDialog from '@/components/Collection/CreateDocumentDialog'

const Page: Component<DataCollection> = () => {
  const [data] = useData<DataCollection>()
  const [idDocumentCreated, setIdDocumentCreated] = createSignal('')

  return (
    <div>
      <h1 class="text-2xl pb-2">Viewing Collection: <b>{data.selectedCollection}</b></h1>

      <Show when={idDocumentCreated()}>
        <div class="mb-2">
          <div role="alert" class="alert alert-success alert-outline">
            <span>Document "<b>{idDocumentCreated()}</b>" added!</span>
          </div>
        </div>
      </Show>

      <CreateDocumentDialog database={data.selectedDatabase} collection={data.selectedCollection} setIdDocumentCreated={setIdDocumentCreated} />

      <Section_DocumentList data={data} />

      <div class="mb-2">
        <Show
          when={data.stats}
          fallback={(
            <>
              <h4>Collection Stats</h4>
              Turn on admin in <b>config.js</b> to view collection stats!
            </>
          )}
        >
          <StatsTable label="Collection Stats" fields={data.stats! as DBStats} />
        </Show>
      </div>
    </div>
  )
}

export default Page
