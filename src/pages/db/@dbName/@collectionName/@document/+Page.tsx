import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Section_Editor from '@/components/Document/Section_Editor'
import DeleteDocument from '@/components/Collection/DeleteDocument'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <Section_Editor docString={data.docString} readOnly={data.readOnly} />

      <div class="m-2">
        <DeleteDocument
          database={data.selectedDatabase}
          collection={data.selectedCollection}
          _id={data._id}
          sub_type={data.subtype}
          showLabel={true}
        />
      </div>
    </>
  )
}

export default Page
