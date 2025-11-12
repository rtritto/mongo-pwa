import { type Component, For, Show } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { reload } from 'vike/client/router'

import IconDelete from '@/components/Icons/IconDelete'
import handleFetchError from '@/components/common/handleFetchError'
import { HEADERS_JSON } from '@/utils/constants'
import { bytesToSize } from '@/utils/mappers/mapUtils'

const IndexTable: Component<{
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <table class="table table-zebra">
      <thead>
        <tr>
          <td>
            <h6><b>Indexes</b></h6>
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

        <Show when={props.data.indexes}>
          <For each={props.data.indexes}>
            {(index) => (
              <tr>
                <td>{index.name}</td>

                <td>{`${Object.keys(index.key)[0]} ${Object.values(index.key)[0] === 1 ? 'ASC' : 'DESC'}`}</td>

                <td>{bytesToSize(index.size)}</td>

                {'partialFilterExpression' in index
                  ? <td><span>partialFilterExpression<pre>{JSON.stringify(index.partialFilterExpression, null, 2)}</pre></span></td>
                  : <td />}

                <Show when={!props.data.options.noDelete && !props.data.options.readOnly}>
                  <td>
                    <button
                      class="btn btn-sm w-full bg-red-700 py-0.5"
                      onClick={() => handleFetchError(
                        fetch('/api/collectionDeleteIndex', {
                          method: 'POST',
                          headers: HEADERS_JSON(props.data.options),
                          body: JSON.stringify({
                            database: props.data.selectedDatabase,
                            collection: props.data.selectedCollection,
                            indexName: index.name
                          })
                        }),
                        props.setData,
                        { success: `Index "${index.name}" deleted!` }
                      ).then(async (response) => {
                        if (response) {
                          await reload()
                        }
                      })}
                    >
                      <IconDelete />

                      Delete
                    </button>
                  </td>
                </Show>
              </tr>
            )}
          </For>
        </Show>
      </tbody>
    </table>
  )
}

export default IndexTable
