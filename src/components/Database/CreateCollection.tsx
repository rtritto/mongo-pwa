import { Show, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import CreateForm from '@/components/common/CreateForm'
import handleFetchError from '@/components/common/functions/handleFetchError'
import { isValidCollectionName } from '@/utils/validationsClient'
import { HEADERS_JSON } from '@/utils/constants'

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
  )
}

export default CreateCollection
