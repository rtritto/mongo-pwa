import { type Component, For, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import CreateForm from '@/components/common/CreateForm'
import DeleteDialog from '@/components/common/DeleteDialog'
import IconVisibility from '@/components/Icons/IconVisibility'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidDatabaseName } from '@/utils/validationsClient'

const ShowDatabases: Component<{
  databases: Mongo['databases']
  show: {
    create: boolean
    delete: boolean
  }
}> = (props) => {
  const [data, setData] = useData<DataIndex>()

  return (
    <div>
      <table class="table">
        <thead>
          <tr>
            <th class="p-0"><h6><b>Databases</b></h6></th>

            <th class="p-0">
              <span class="text-right">
                <Show when={props.show.create}>
                  <CreateForm
                    entity="Database"
                    isValidInput={(input) => isValidDatabaseName(input)}
                    onButtonClick={(database: string) => (
                      fetch('/api/databaseCreate', {
                        method: 'POST',
                        body: JSON.stringify({ database }),
                        headers: HEADERS_JSON
                      }).then(async (res) => {
                        if (res.ok) {
                          // Add database to global databases to update viewing databases
                          setData({
                            databases: [...data.databases, database].toSorted(),
                            success: `Database "${database}" created!`
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
          <For each={props.databases}>
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

                <Show when={props.show.delete}>
                  <td class="p-0.5">
                    <DeleteDialog
                      title="Delete Database"
                      value={database}
                      message="Be careful! You are about to delete the database (all collections and documents will be deleted)"
                      fullWidth={true}
                      enableInput={true}
                      showLabel={true}
                      handleDelete={() => fetch('/api/databaseDelete', {
                        method: 'POST',
                        headers: HEADERS_JSON,
                        body: JSON.stringify({ database })
                      }).then(async (res) => {
                        if (res.ok) {
                          // Remove database from global database to update viewing databases
                          const indexToRemove = data.databases.indexOf(database)
                          setData('databases', [
                            ...data.databases.slice(0, indexToRemove),
                            ...data.databases.slice(indexToRemove + 1)
                          ])
                          // setSuccess(`Database "${database}" deleted!`)
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
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default ShowDatabases
