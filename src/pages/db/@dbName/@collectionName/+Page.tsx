import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import StatsTable from '@/components/common/StatsTable'
import JsonViewer from '@/components/Collection/JsonViewer'

const _data = {
  id: 42,
  name: "Elysia",
  skills: ["SolidJS", "Rust", "Hono"],
  projects: {
    ui: {
      framework: "Solid",
      style: "Tailwind"
    },
    backend: {
      language: "Rust",
      rpc: "Tonic"
    }
  }
}

const Page: Component<DataCollection> = () => {
  const [data] = useData<DataCollection>()

  return (
    <div>
      <h1>Collection name</h1>

      {/* {props.collectionName} */}

      {/* <main class="p-8 bg-gray-950 min-h-screen text-white">
      <h1 class="text-2xl font-bold mb-4">JSON Viewer</h1> */}
      <JsonViewer data={_data} />
      {/* </main> */}

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
