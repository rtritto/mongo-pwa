import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Alerts from '@/components/common/Alerts'
import StatsTable from '@/components/common/StatsTable'
import ShowCollections from '@/components/Database/ShowCollections'

const Page: Component<DataDB> = () => {
  const [data, setData] = useData<DataDB>()

  return (
    <div class="p-1">
      {/* (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833 */}
      <Alerts data={data} />

      <h4>Viewing Database: <strong>{data.selectedDatabase}</strong></h4>

      <div class="divider m-1.5" />

      <ShowCollections data={data} setData={setData} />

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
