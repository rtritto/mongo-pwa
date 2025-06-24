import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import CodeHighlighter from '@/components/Document/CodeHighlighter'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <CodeHighlighter docString={data.docString} readOnly={data.readOnly} highlighted={data.highlighted} />
    </>
  )
}

export default Page
