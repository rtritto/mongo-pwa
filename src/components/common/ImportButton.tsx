import type { Component, JSX } from 'solid-js'

import IconImport from '@/components/Icons/IconImport'

const ImportButton: Component<{
  database: string
  collection: string
}> = (props) => {
  const onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event> = async (event) => {
    event.preventDefault()

    const { files } = event.target

    if (!files || files.length === 0) {
      return
    }
    if (files.length > 1) {
      // console.info('Multiple files selected')
      return
    }

    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('database', props.database)
    formData.append('collection', props.collection)

    const response = await fetch('/api/collectionImport', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      console.error('Failed to upload file')
      console.log(await response.text())
      return
    }
    const { insertedCount } = await response.json()
    console.log(`Inserted ${insertedCount} documents`)
  }

  return (
    <form id="fileinfo" name="fileinfo" enctype="multipart/form-data" method="post">
      <label for={`file-input-${props.collection}`} class="btn btn-sm bg-yellow-600">
        <IconImport />

        Import
      </label>

      <input
        id={`file-input-${props.collection}`}
        class="hidden"
        type="file"
        accept=".json, .csv"
        onChange={onChange}
      />
    </form>
  )
}

export default ImportButton
