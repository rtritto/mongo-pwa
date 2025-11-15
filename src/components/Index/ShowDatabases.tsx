import { type Component, For, Show } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import DeleteDialog from '@/components/common/DeleteDialog'
import handleFetchError from '@/components/common/functions/handleFetchError'
import IconVisibility from '@/components/Icons/IconVisibility'
import CreateDatabase from './CreateDatabase'
import { HEADERS_JSON } from '@/utils/constants'

const ShowDatabases: Component<{
  data: DataIndex
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <div class="border border-base-300 rounded-box my-2">
      <CreateDatabase data={props.data} setData={props.setData} />

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
