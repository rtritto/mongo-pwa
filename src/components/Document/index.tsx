import type { Component } from 'solid-js'
import { useData } from 'vike-lite-solid'

import Editor from './Editor'

const DocumentPage: Component<DataDocument> = () => {
  const [data, setData] = useData<DataDocument>()
  return (
    <div>
      <h1>{data.title}</h1>

      <Editor data={data} setData={setData} />
    </div>
  )
}

export default DocumentPage
