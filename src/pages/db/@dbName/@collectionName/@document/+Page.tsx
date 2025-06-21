import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <textarea class="textarea h-full" readonly={data.readOnly}>{data.docString}</textarea>
    </>
  )
}

export default Page
