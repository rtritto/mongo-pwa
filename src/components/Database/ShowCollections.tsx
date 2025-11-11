import { For, Show, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import DeleteDialog from '@/components/common/DeleteDialog'
import ExportCollectionButton from '@/components/common/ExportCollectionButton'
import ImportButton from '@/components/common/ImportButton'
import handleFetchError from '@/components/common/handleFetchError'
import IconVisibility from '@/components/Icons/IconVisibility'
import CreateCollection from './CreateCollection'
import { HEADERS_JSON } from '@/utils/constants'

const ShowCollections: Component<{
  query?: QueryParameter
  data: DataDB
  setData: SetStoreFunction<DataDB>
}> = (props) => {

  return (
    <div class="border border-base-300 rounded-box my-2">
      <CreateCollection data={props.data} setData={props.setData} />

      <table class="table">
        <tbody>
          <For each={props.data.collections}>
            {(collection) => {
              return (
                <tr>
                  <td class="p-0.5">
                    <a class="btn btn-sm bg-green-600" href={`/db/${encodeURIComponent(props.data.selectedDatabase)}/${encodeURIComponent(collection)}`}>
                      <IconVisibility />

                      View
                    </a>
                  </td>

                  <Show when={!props.data.options.noExport}>
                    <td class="p-0.5">
                      <ExportCollectionButton
                        collection={collection}
                        query={props.query!}
                        data={props.data}
                        setData={props.setData}
                      />
                    </td>
                  </Show>

                  <td class="p-0.5">
                    <ImportButton database={props.data.selectedDatabase} collection={collection} setData={props.setData} />
                  </td>

                  <td class="p-0.5">
                    <a class="btn w-full" href={`/db/${encodeURIComponent(props.data.selectedDatabase)}/${encodeURIComponent(collection)}`}>
                      <h6>{collection}</h6>
                    </a>
                  </td>

                  <Show when={!props.data.options.noDelete}>
                    <td class="p-0.5">
                      <DeleteDialog
                        title="Delete Collection"
                        message="Be careful! You are about to delete the collection (all documents will be deleted)"
                        value={collection}
                        label="Delete"
                        fullWidth
                        enableInput
                        handleDelete={() => handleFetchError(
                          fetch('/api/collectionDelete', {
                            method: 'POST',
                            headers: HEADERS_JSON(props.data.options),
                            body: JSON.stringify({ database: props.data.selectedDatabase, collection })
                          }),
                          props.setData,
                          (() => {
                            // Remove database from global database to update viewing databases
                            const indexToRemove = props.data.collections.indexOf(collection)
                            return {
                              collections: [
                                ...props.data.collections.slice(0, indexToRemove),
                                ...props.data.collections.slice(indexToRemove + 1)
                              ],
                              success: `Collection "${collection}" deleted!`
                            }
                          })()
                        ) as Promise<void>}
                      />
                    </td>
                  </Show>
                </tr>
              )
            }}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default ShowCollections
