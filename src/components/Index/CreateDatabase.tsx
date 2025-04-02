// TODO import { Box, Button, FormGroup, SvgIcon, TextField } from '@suid/material'
// TODO import { useForm, Controller } from 'react-hook-form'
import { createSignal } from 'solid-js'

import IconAdd from '../../components/Icons/IconAdd'
// import { isValidDatabaseName } from 'lib/validations'
import { useData } from 'vike-solid/useData'

const CreateDatabase = () => {
  const [database, setDatabase] = createSignal('')
  const [_data, setData] = useData<DataIndex>()
  // const methods = useForm({ mode: 'onChange' })

  const handleCreateDatabase = async () => {
    await fetch('/api/db', {
      method: 'POST',
      body: JSON.stringify({ database: database() }),
      headers: { 'Content-Type': 'application/json' }
    }).then(async (res) => {
      if (res.ok) {
        // Add database to global databases to update viewing databases
        setData({
          databases: [..._data.databases, database()].sort(),
          success: `Database "${database()}" created!`
        })
        setDatabase('')  // Reset value
      } else {
        const { error } = await res.json()
        setData({ error })
      }
    }).catch((error) => {
      setData({ error })
    })
  }

  return (
    <>
      {/* <FormGroup>
        <Box>
          <Controller
            control={methods.control}
            name="controllerCreateDatabase"
            render={({ field: { onChange } }) => (
              <TextField
                id="database"
                error={database() !== '' && 'controllerCreateDatabase' in methods.formState.errors}
                helperText={database() !== '' && (methods.formState.errors.controllerCreateDatabase?.message || '')}
                name="database"
                onChange={({ target: { value } }) => {
                  setDatabase(value)
                  onChange(value)
                }}
                placeholder="Database name"
                required
                size="small"
                type="string"
                value={database()}
                variant="outlined"
              // sx={{ paddingBottom: 0 }}
              />
            )}
            rules={{ validate: (value) => isValidDatabaseName(value).error }}
          />

          <Button
            disabled={!database() || 'controllerCreateDatabase' in methods.formState.errors}
            size="small"
            startIcon={<IconAdd />}
            // type="submit"
            variant="contained"
            onClick={handleCreateDatabase}
            sx={{ textTransform: 'none', py: 1 }}
          >
            Create Database
          </Button>
        </Box>
      </FormGroup> */}
    </>
  )
}

export default CreateDatabase
