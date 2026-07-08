import { type Component, Show } from 'solid-js'
import { useData, useUrl } from 'vike-lite-solid'

import Alerts from '@/components/common/Alerts'
import StatsTable from '@/components/common/StatsTable'
import ShowCollections from './ShowCollections'

const DatabasePage: Component<DataDB> = () => {
  const [data, setData] = useData<DataDB>()

  let url
  if (!data.options.noExport) {
    url = useUrl()
  }

  return (
    <div class="p-1">
      {/* (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833 */}
      <Alerts data={data} />

      <h4>Viewing Database: <strong>{data.selectedDatabase}</strong></h4>

      <div class="divider m-1.5" />

      <ShowCollections query={url ? Object.fromEntries(new URLSearchParams(url().search)) as QueryParameter : undefined} data={data} setData={setData} />

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
          <div class="my-2 overflow-x-auto rounded-box border border-base-300">
            <StatsTable label="Database Stats" fields={data.stats! as DBStats} />
          </div>
        </Show>
      </div>
    </div>
  )
}

export default DatabasePage
