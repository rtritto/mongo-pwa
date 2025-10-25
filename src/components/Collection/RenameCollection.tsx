import { createSignal, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'

import handleFetchError from '@/components/common/handleFetchError'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidCollectionName } from '@/utils/validationsClient'

const RenameCollection: Component<{
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  let buttonRef: HTMLButtonElement | undefined
  const [newName, setNewName] = createSignal('')

  return (
    <table class="table mb-2">
      <thead>
        <tr>
          <th class="p-0"><h6><b>Rename Collection</b></h6></th>

          <th class="p-0">
            <div class="input w-full">
              <label class="label mx-0.5">
                <span class="label-text">{props.data.selectedDatabase} . </span>

                <input
                  type="text"
                  placeholder={props.data.selectedCollection}
                  class="input input-bordered w-full"
                  value={newName()}
                  onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      buttonRef!.click()
                    } else {
                      setNewName(event.currentTarget.value.trim())
                    }
                  }}
                />
              </label>

              <button
                class="btn btn-primary mx-0.5"
                ref={buttonRef}
                disabled={!!isValidCollectionName(newName()).error}
                onClick={() => handleFetchError(
                  fetch('/api/collectionRename', {
                    method: 'POST',
                    headers: HEADERS_JSON(props.data.options),
                    body: JSON.stringify({
                      database: props.data.selectedDatabase,
                      collection: props.data.selectedCollection,
                      newCollection: newName()
                    })
                  }),
                  props.setData,
                  (() => {
                    // Replace collection from global database to update viewing databases
                    const indexToRemove = props.data.collections.indexOf(props.data.selectedCollection)
                    return {
                      collections: [
                        ...props.data.collections.slice(0, indexToRemove),
                        ...props.data.collections.slice(indexToRemove + 1),
                        newName()
                      ].toSorted(),
                      selectedCollection: newName(),
                      success: `Collection renamed to "${newName()}"!`
                    }
                  })()
                ).then(() => {
                  setNewName('')
                })}
              >
                Rename Collection
              </button>
            </div>
          </th>
        </tr>
      </thead>
    </table>
  )
}

export default RenameCollection
