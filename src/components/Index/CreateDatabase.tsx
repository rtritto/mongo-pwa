import { createSignal } from 'solid-js'
import { useData } from 'vike-solid/useData'

import IconAdd from '@/components/Icons/IconAdd'
import { HEADERS_JSON } from '@/utils/constants'
import { isValidDatabaseName } from '@/utils/validations'

const CreateDatabase = () => {
  const [database, setDatabase] = createSignal('')
  const [invalidDatabaseMessage, setInvalidDatabaseMessage] = createSignal()
  const [data, setData] = useData<DataIndex>()

  return (
    <form>
      <input
        class="input mx-0.5"
        type="text"
        placeholder="New Database"
        value={database()}
        onKeyUp={(event) => {
          setDatabase(event.currentTarget.value.trim())
          if (database().length > 0) {
            setInvalidDatabaseMessage(isValidDatabaseName(database()).error)
          }
        }}
      />

      <button
        class={`btn bg-blue-700 mx-0.5${invalidDatabaseMessage() ? ' input-error' : ''}`}
        type="submit"
        onClick={() => (async (database: string) => {
          await fetch('/api/databaseCreate', {
            method: 'POST',
            body: JSON.stringify({ database }),
            headers: HEADERS_JSON
          }).then(async (res) => {
            if (res.ok) {
              // Add database to global databases to update viewing databases
              setData({
                databases: [...data.databases, database].sort(),
                success: `Database "${database}" created!`
              })
              setDatabase('')  // Reset value
            } else {
              const { error } = await res.json()
              setData({ error })
            }
          }).catch((error) => {
            setData({ error })
          })
        })(database())}
        disabled={!!invalidDatabaseMessage()}
      >
        <IconAdd />

        Create
      </button>
    </form>
  )
}

export default CreateDatabase
