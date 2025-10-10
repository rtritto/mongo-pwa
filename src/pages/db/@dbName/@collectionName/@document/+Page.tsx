import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Section_Editor from '@/components/Document/Section_Editor'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <Section_Editor data={data} />
    </>
  )
}

export default Page
