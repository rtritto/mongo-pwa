import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Alerts from '@/components/common/Alerts'
import StatsTable from '@/components/common/StatsTable'
import ShowDatabases from '@/components/Index/ShowDatabases'

const Page: Component<DataIndex> = () => {
  const [data, setData] = useData<DataIndex>()

  return (
    <div class="p-1">
      {/* (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833 */}
      <Alerts data={data} />

      <h1>Mongo PWA</h1>

      <div class="divider m-1.5" />

      <ShowDatabases
        databases={data.databases}
        options={data.options}
        show={{
          create: !data.options.readOnly,
          delete: !data.options.noDelete && !data.options.readOnly
        }}
        setData={setData}
      />

      <div class="mb-2">
        <Show
          when={data.stats}
          fallback={(
            <>
              <h4>Server Stats</h4>
              Turn on admin in <b>config.js</b> to view server stats!
            </>
          )}
        >
          <StatsTable label="Server Status" fields={data.stats! as ServerStats} />
        </Show>
      </div>
    </div>
  )
}

export default Page
