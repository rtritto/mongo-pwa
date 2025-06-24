import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Editor from '@/components/Document/Editor'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <Editor docString={data.docString} readOnly={data.readOnly} highlighted={data.highlighted} />
    </>
  )
}

export default Page
