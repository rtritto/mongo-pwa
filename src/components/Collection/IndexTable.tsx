import { type Component, For, Show } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { reload } from 'vike/client/router'

import IconDelete from '@/components/Icons/IconDelete'
import handleFetchError from '@/components/common/handleFetchError'
import { HEADERS_JSON } from '@/utils/constants'
import { bytesToSize } from '@/utils/mappers/mapUtils'

const IndexTable: Component<{
  label: string
  fields: Index[]
  database: string
  collection: string
  options: Config['options']
  show: {
    create: boolean
    delete: boolean
  }
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <td>
              <h6><b>{props.label}</b></h6>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>
              <b>Name</b>
            </th>

            <th>
              <b>Columns</b>
            </th>

            <th>
              <b>Size</b>
            </th>

            <th>
              <b>Attributes</b>
            </th>

            <th>
              <b>Actions</b>
            </th>
          </tr>

          <For each={props.fields}>
            {(index) => (
              <tr>
                <td>{index.name}</td>

                <td>{`${Object.keys(index.key)[0]} ${Object.values(index.key)[0] === 1 ? 'ASC' : 'DESC'}`}</td>

                <td>{bytesToSize(index.size)}</td>

                {/* TODO implement logic of value */}
                <td>{index.v}</td>

                <Show when={props.show.delete}>
                  <td>
                    <button class="btn btn-sm bg-red-700 py-0.5" onClick={async () => {
                      const response = await handleFetchError(
                        fetch('/api/collectionDeleteIndex', {
                          method: 'POST',
                          headers: HEADERS_JSON(props.options),
                          body: JSON.stringify({
                            database: props.database,
                            collection: props.collection,
                            indexName: index.name
                          })
                        }),
                        props.setData
                      )
                      if (response) {
                        await reload()
                        props.setData('success', `Index "${index.name}" deleted!`)
                      }
                    }}>
                      <IconDelete />

                      Delete
                    </button>
                  </td>
                </Show>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default IndexTable
