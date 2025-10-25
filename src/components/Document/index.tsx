import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import Alerts from '@/components/common/Alerts'
import Editor from './Editor'

const DocumentPage: Component<DataDocument> = () => {
  const [data, setData] = useData<DataDocument>()
  return (
    <div>
      {/*
        (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
        Should be moved to LayoutDefault.tsx:
          to test:
          - navigate to /db/<DB>/<COL>
          - click view doc to navigate to /db/<DB>/<COL>/<DOC>
          - change the doc
          - click BackButton
          - the alert should appear if it works
      */}
      <Alerts data={data} />

      <h1>{data.title}</h1>

      <Editor data={data} setData={setData} />
    </div>
  )
}

export default DocumentPage
