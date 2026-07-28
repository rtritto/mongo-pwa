import { Show, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import CreateForm from '@/components/common/CreateForm'
import apiCall from '@/components/common/functions/apiCall'
import isValidCollectionName from '@/utils/validations/isValidCollectionName'

const CreateCollection: Component<{
  data: DataDB
  setData: SetStoreFunction<DataDB>
}> = (props) => {
  return (
    <table class="table mb-2">
      <thead>
        <tr>
          <th class="p-0"><h6><b>Collections</b></h6></th>

          <th class="p-0">
            <span class="text-right">
              <Show when={!props.data.options.readOnly}>
                <CreateForm
                  entity="Collection"
                  isValidInput={(input) => isValidCollectionName(input)}
                  onButtonClick={(collection: string) => apiCall(
                    '/api/collectionCreate',
                    JSON.stringify({ collection, database: props.data.selectedDatabase }),
                    props.setData,
                    // Add database to global collections to update viewing collections
                    {
                      collections: [...props.data.collections, collection].toSorted((a, b) => a.localeCompare(b)),
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
  )
}

export default CreateCollection
