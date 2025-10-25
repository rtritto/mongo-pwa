import { type Component, Show } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import CreateForm from '@/components/common/CreateForm'
import handleFetchError from '@/components/common/handleFetchError'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidDatabaseName } from '@/utils/validationsClient'

const CreateDatabase: Component<{
  data: DataIndex
  setData: SetStoreFunction<any>
}> = (props) => {
  return (
    <table class="table mb-2">
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
  )
}

export default CreateDatabase
