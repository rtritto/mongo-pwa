import { type Component, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Section_DocumentList from '@/components/Collection/Section_DocumentList'
import StatsTable from '@/components/common/StatsTable'
// TODO remove
// import JsonViewer from '@/components/Collection/JsonViewer'

// const _data = {
//   id: 42,
//   name: "Elysia",
//   skills: ["SolidJS", "Rust", "Hono"],
//   projects: {
//     ui: {
//       framework: "Solid",
//       style: "Tailwind"
//     },
//     backend: {
//       language: "Rust",
//       rpc: "Tonic"
//     }
//   }
// }

const Page: Component<DataCollection> = () => {
  const [data] = useData<DataCollection>()

  return (
    <div>
      <h1 class="text-2xl pb-2">Viewing Collection: {data.selectedCollection}</h1>

      {/* <JsonViewer data={_data} /> */}

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
