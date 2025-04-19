import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import ShowCollections from '@/components/Database/ShowCollections'
import StatsTable from '@/components/common/StatsTable'

const Page: Component<DataDB> = () => {
  const [data] = useData<DataDB>()

  return (
    <div class="p-1">
      <h4>Viewing Database: <strong>{data.selectedDatabase}</strong></h4>

      <div class="divider m-1.5" />

      <ShowCollections
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

      <StatsTable label="Database Stats" fields={data.dbStats!} />
    </div>
  )
}

export default Page
