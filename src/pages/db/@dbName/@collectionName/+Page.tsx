import type { Component } from 'solid-js'

import { JsonViewer } from '@/components/Collection/JsonViewer'

const data = {
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

const Page: Component<DataDB> = (props) => {
  return (
    <>
      <h1>Collection name</h1>

      {/* {props.collectionName} */}

      {/* <main class="p-8 bg-gray-950 min-h-screen text-white">
      <h1 class="text-2xl font-bold mb-4">JSON Viewer</h1> */}
      <JsonViewer data={data} />
      {/* </main> */}
    </>
  )
}

export default Page
