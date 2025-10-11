import { For, Show, type Component } from 'solid-js'
import { useData } from 'vike-solid/useData'
import { usePageContext } from 'vike-solid/usePageContext'

import CreateForm from '@/components/common/CreateForm'
import DeleteDialog from '@/components/common/DeleteDialog'
import ExportButton from '@/components/common/ExportButton'
import ImportButton from '@/components/common/ImportButton'
import IconVisibility from '@/components/Icons/IconVisibility'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidCollectionName } from '@/utils/validationsClient'

const ShowCollections: Component<{
  collections: string[]
  dbName: string
  show: {
    create: boolean
    delete: boolean
    export: boolean
  }
}> = (props) => {
  const pageContext = usePageContext()
  const [data, setData] = useData<DataDB>()

  return (
    <div>
      <table class="table">
        <thead>
          <tr>
            <th class="p-0"><h6><b>Collections</b></h6></th>

            <th class="p-0">
              <span class="text-right">
                <Show when={props.show.create}>
                  <CreateForm
                    entity="Collection"
                    isValidInput={(input) => isValidCollectionName(input)}
                    onButtonClick={(collection: string) => (
                      fetch('/api/collectionCreate', {
                        method: 'POST',
                        body: JSON.stringify({ collection, database: props.dbName }),
                        headers: HEADERS_JSON
                      }).then(async (res) => {
                        if (res.ok) {
                          // Add database to global collections to update viewing collections
                          setData({
                            collections: [...data.collections, collection].toSorted(),
                            success: `Collection "${collection}" created!`
                          })
                        } else {
                          const { error } = await res.json()
                          setData({ error })
                        }
                      }).catch((error) => {
                        setData({ error })
                      })
                    )}
                  />
                </Show>
              </span>
            </th>
          </tr>
        </thead>
      </table>

      <table class="table">
        <tbody>
          <For each={props.collections}>
            {(collection) => {
              return (
                <tr>
                  <td class="p-0.5">
                    <a class="btn btn-sm bg-green-600" href={`/db/${encodeURIComponent(props.dbName)}/${encodeURIComponent(collection)}`}>
                      <IconVisibility />

                      View
                    </a>
                  </td>

                  <Show when={props.show.export}>
                    {/* (?) Deprecated */}
                    {/* <td class="p-0.5">
                      <ExportButton
                        url="/api/collectionExport"
                        label="Export"
                        database={props.dbName}
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
                        database={props.dbName}
                        collection={collection}
                        query={pageContext.urlParsed.search}
                        setData={setData}
                      />
                    </td>
                  </Show>

                  <td class="p-0.5">
                    <ImportButton database={props.dbName} collection={collection} />
                  </td>

                  <td class="p-0.5">
                    <a class="btn" href={`/db/${encodeURIComponent(props.dbName)}/${encodeURIComponent(collection)}`}>
                      <h6>{collection}</h6>
                    </a>
                  </td>

                  <Show when={props.show.delete}>
                    <td class="p-0.5">
                      <DeleteDialog
                        title="Delete Collection"
                        value={collection}
                        message="Be careful! You are about to delete the collection (all documents will be deleted)"
                        fullWidth={true}
                        enableInput={true}
                        showLabel={true}
                        handleDelete={() => fetch('/api/collectionDelete', {
                          method: 'POST',
                          headers: HEADERS_JSON,
                          body: JSON.stringify({ database: props.dbName, collection })
                        }).then(async (res) => {
                          if (res.ok) {
                            // Remove database from global database to update viewing databases
                            const indexToRemove = data.collections.indexOf(collection)
                            setData('collections', [
                              ...data.collections.slice(0, indexToRemove),
                              ...data.collections.slice(indexToRemove + 1)
                            ])
                            // setSuccess(`Collection "${collection}" deleted!`)
                          } else {
                            // const { error } = await res.json()
                            // setError(error)
                          }
                        })
                          // .catch((error) => { setError(error.message) })
                        }
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
