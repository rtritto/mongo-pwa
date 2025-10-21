import { For, Show, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { usePageContext } from 'vike-solid/usePageContext'

import CreateForm from '@/components/common/CreateForm'
import DeleteDialog from '@/components/common/DeleteDialog'
import ExportButton from '@/components/common/ExportButton'
import ImportButton from '@/components/common/ImportButton'
import handleFetchError from '@/components/common/handleFetchError'
import IconVisibility from '@/components/Icons/IconVisibility'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidCollectionName } from '@/utils/validationsClient'

const ShowCollections: Component<{
  data: DataDB
  setData: SetStoreFunction<DataDB>
}> = (props) => {
  const pageContext = usePageContext()

  return (
    <div>
      <table class="table">
        <thead>
          <tr>
            <th class="p-0"><h6><b>Collections</b></h6></th>

            <th class="p-0">
              <span class="text-right">
                <Show when={!props.data.options.readOnly}>
                  <CreateForm
                    entity="Collection"
                    isValidInput={(input) => isValidCollectionName(input)}
                    onButtonClick={(collection: string) => handleFetchError(
                      fetch('/api/collectionCreate', {
                        method: 'POST',
                        body: JSON.stringify({ collection, database: props.data.selectedDatabase }),
                        headers: HEADERS_JSON(props.data.options)
                      }),
                      props.setData,
                      // Add database to global collections to update viewing collections
                      {
                        collections: [...props.data.collections, collection].toSorted(),
                        success: `Collection "${collection}" created!`
                      }
                    ) as Promise<void>}
                  />
                </Show>
              </span>
            </th>
          </tr>
        </thead>
      </table>

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
                    {/* (?) Deprecated */}
                    {/* <td class="p-0.5">
                      <ExportButton
                        url="/api/collectionExport"
                        label="Export"
                        database={props.data.selectedDatabase}
                        collection={collection}
                        query={pageContext.urlParsed.search}
                        setData={setData}
                      />
                    </td> */}

                    <td class="p-0.5">
                      <ExportButton
                        url="/api/collectionExportArray"
                        // If "Export" is deprecated, use "ExportArray" as default "Export"
                        label="Export"
                        // label="[JSON]"
                        database={props.data.selectedDatabase}
                        collection={collection}
                        query={pageContext.urlParsed.search}
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
