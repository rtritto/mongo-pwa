import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'
import { navigate } from 'vike/client/router'

import DeleteDocument from '@/components/Collection/DeleteDocument'
import Section_Editor from '@/components/Document/Section_Editor'
import IconBack from '@/components/Icons/IconBack'

const Page: Component<DataDocument> = () => {
  const [data] = useData<DataDocument>()
  return (
    <>
      <h1>{data.title}</h1>

      <Section_Editor docString={data.docString} readOnly={data.readOnly} />

      <div class="m-2">
        <button class="btn btn-sm bg-yellow-500 py-0.5 text-right" onClick={async () => {
          await navigate(`/db/${data.selectedDatabase}/${data.selectedCollection}`)
        }}>
          <IconBack />

          Back
        </button>
      </div>


      <div class="m-2">
        <DeleteDocument
          database={data.selectedDatabase}
          collection={data.selectedCollection}
          _id={data._id}
          sub_type={data.subtype}
          doReload={false}
          showLabel={true}
        />
      </div>
    </>
  )
}

export default Page
