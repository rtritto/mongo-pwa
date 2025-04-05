import type { Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

import DeleteDialog from '@/components/common/DeleteDialog'
import { HEADERS_JSON } from '@/utils/constants'

const DeleteDatabase: Component<{ database: string }> = (props) => {
  const [data, setData] = useData<DataIndex>()
  // TODO handle success and error messages

  const handleDelete = async (database: string) => {
    await fetch('/api/databaseDelete', {
      method: 'POST',
      headers: HEADERS_JSON,
      body: JSON.stringify({
        database
      })
    }).then(async (res) => {
      if (res.ok === true) {
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

  return (
    <DeleteDialog
      title="Delete Database"
      value={props.database}
      message="Be careful! You are about to delete the database (all collections and documents will be deleted)"
      handleDelete={() => handleDelete(props.database)}
    />
  )
}

export default DeleteDatabase
