import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Section_ShowCollections from '@/components/Database/Section_ShowCollections'
import StatsTable from '@/components/common/StatsTable'

const Page: Component<DataDB> = () => {
  const [data] = useData<DataDB>()

  return (
    <div class="p-1">
      <h4>Viewing Database: <strong>{data.selectedDatabase}</strong></h4>

      <div class="divider m-1.5" />

      <Section_ShowCollections
        collections={data.collections}
        dbName={data.selectedDatabase}
        show={{
          create: !data.options.readOnly,
          export: !data.options.noExport,
          delete: !data.options.noDelete
        }}
      />

      {/* TODO GridFS Buckets grids.length && settings.gridFSEnabled */}

      {/* TODO Create GridFS Bucket */}

      <div class="mb-2">
        <Show
          when={data.stats}
          fallback={(
            <>
              <h4>Database Stats</h4>
              Turn on admin in <b>config.js</b> to view database stats!
            </>
          )}
        >
          <StatsTable label="Database Stats" fields={data.stats! as DBStats} />
        </Show>
      </div>
    </div>
  )
}

export default Page
