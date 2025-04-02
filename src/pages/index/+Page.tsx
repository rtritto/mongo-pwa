import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import StatsTable from '@/components/common/StatsTable'
import ShowDatabases from '@/components/Index/ShowDatabases'

const Page: Component<DataIndex> = () => {
  const [data] = useData<DataIndex>()

  return (
    <div class="p-1">
      <h1>Mongo PWA</h1>

      <div class="divider m-1.5" />

      <ShowDatabases
        databases={data.databases}
        show={{
          create: !data.options.readOnly,
          delete: !data.options.noDelete && !data.options.readOnly
        }}
      />

      <div class="mb-2">
        <Show
          when={data.serverStats}
          fallback={(
            <>
              <h4>Server Stats</h4>
              Turn on admin in <b>config.js</b> to view server stats!
            </>
          )}
        >
          <StatsTable label="Server Status" fields={data.serverStats!} />
        </Show>
      </div>
    </div>
  )
}

export default Page
