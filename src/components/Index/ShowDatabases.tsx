import { type Component, For, Show } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import CreateForm from '@/components/common/CreateForm'
import DeleteDialog from '@/components/common/DeleteDialog'
import handleFetchError from '@/components/common/handleFetchError'
import IconVisibility from '@/components/Icons/IconVisibility'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidDatabaseName } from '@/utils/validationsClient'

const ShowDatabases: Component<{
  data: DataIndex
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <div>
      <table class="table">
        <thead>
          <tr>
            <th class="p-0"><h6><b>Databases</b></h6></th>

            <th class="p-0">
              <span class="text-right">
                <Show when={!props.data.options.readOnly}>
                  <CreateForm
                    entity="Database"
                    isValidInput={(input) => isValidDatabaseName(input)}
                    onButtonClick={(database: string) => handleFetchError(
                      fetch('/api/databaseCreate', {
                        method: 'POST',
                        body: JSON.stringify({ database }),
                        headers: HEADERS_JSON(props.data.options)
                      }),
                      props.setData,
                      // Add database to global databases to update viewing databases
                      {
                        databases: [...props.data.databases, database].toSorted(),
                        success: `Database "${database}" created!`
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
          <For each={props.data.databases}>
            {(database) => (
              <tr>
                <td class="p-0.5">
                  <a class="btn btn-sm w-full bg-green-600" href={`/db/${encodeURIComponent(database)}`}>
                    <IconVisibility />

                    View
                  </a>
                </td>

                <td class="p-0.5">
                  <a class="btn w-full" href={`/db/${encodeURIComponent(database)}`}>
                    <h6>{database}</h6>
                  </a>
                </td>

                <Show when={!props.data.options.noDelete && !props.data.options.readOnly}>
                  <td class="p-0.5">
                    <DeleteDialog
                      title="Delete Database"
                      message="Be careful! You are about to delete the database (all collections and documents will be deleted)"
                      value={database}
                      label="Delete"
                      fullWidth
                      enableInput
                      handleDelete={() => handleFetchError(
                        fetch('/api/databaseDelete', {
                          method: 'POST',
                          headers: HEADERS_JSON(props.data.options),
                          body: JSON.stringify({ database })
                        }),
                        props.setData,
                        (() => {
                          // Remove database from global database to update viewing databases
                          const indexToRemove = props.data.databases.indexOf(database)
                          return {
                            databases: [
                              ...props.data.databases.slice(0, indexToRemove),
                              ...props.data.databases.slice(indexToRemove + 1)
                            ],
                            success: `Database "${database}" deleted!`
                          }
                        })()
                      ) as Promise<void>}
                    />
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

export default ShowDatabases
