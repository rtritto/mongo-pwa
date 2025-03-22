import { useSetAtom } from 'solid-jotai'
import { Component } from 'solid-js'

import { EP_API_DATABASE } from '../../configs/endpoints'
import DeleteDialog from '../../components/common/DeleteDialog'
import { databasesState, messageErrorState, messageSuccessState } from '../../components/store/globalAtoms'

const tooltipTitle = 'Do you want to delete this database? All collections and documents will be deleted.'

const DeleteDatabase: Component<{ database: string }> = (props) => {
  const setDatabases = useSetAtom(databasesState)
  const setSuccess = useSetAtom(messageSuccessState)
  const setError = useSetAtom(messageErrorState)

  const handleDelete = async (database: string) => {
    await fetch(EP_API_DATABASE(database), {
      method: 'DELETE'
    }).then(async (res) => {
      if (res.ok === true) {
        // Remove database from global database to update viewing databases
        setDatabases((databases) => {
          const indexToRemove = databases.indexOf(database)
          return [
            ...databases.slice(0, indexToRemove),
            ...databases.slice(indexToRemove + 1)
          ]
        })
        setSuccess(`Database "${database}" deleted!`)
      } else {
        const { error } = await res.json()
        setError(error)
      }
    }).catch((error) => { setError(error.message) })
  }

  return (
    <DeleteDialog
      value={props.database}
      entity="database"
      tooltipTitle={tooltipTitle}
      handleDelete={() => handleDelete(props.database)}
    />
  )
}

export default DeleteDatabase
