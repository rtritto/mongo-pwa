import { Paper, SvgIcon, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@suid/material'
import { useSetAtom } from 'solid-jotai'
import { type Component, For } from 'solid-js'

import { EP_DB } from '../../configs/endpoints'
import { Visibility } from '../../components/SvgIcons'
import CustomLink from '../../components/common/CustomLink'
import CreateDatabase from './CreateDatabase'
import DeleteDatabase from './DeleteDatabase'
import { selectedDatabaseState } from '../../components/store/globalAtoms'

const TableCellStyle = {
  // border: 1,
  p: 0.5
}

const ShowDatabases: Component<{
  databases: string[]
  show: {
    create: boolean
    delete: boolean
  }
}> = (props) => {
  const setSelectedDatabaseState = useSetAtom(selectedDatabaseState)

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderRight: 'none', p: 1.5 }}>
              <Typography component='h6' variant='h6' sx={{ fontWeight: 'bold' }}>
                Databases
              </Typography>
            </TableCell>

            <TableCell sx={{ px: 1.5, borderLeft: 'none' }} align="right" colSpan={2}>
              {props.show.create === true && <CreateDatabase />}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <For each={props.databases}>
            {(database) => {
              const encodedDatabase = encodeURIComponent(database)
              const hrefView = `${EP_DB}/${encodedDatabase}`
              return (
                <TableRow>
                  <TableCell sx={TableCellStyle}>
                    <CustomLink
                      LinkProps={{
                        href: hrefView,
                        style: {
                          margin: '1px',
                          // textDecoration: 'none'  // remove text underline  // missing, not necessary
                        }
                      }}
                      ButtonProps={{
                        startIcon: <SvgIcon><path d={Visibility} /></SvgIcon>,
                        variant: 'contained',
                        sx: {
                          backgroundColor: 'rgb(86, 124, 86)',
                          flexDirection: 'column',
                          py: 0.5,
                          textTransform: 'none',
                          width: '100%'
                        }
                      }}
                    >
                      View
                    </CustomLink>
                  </TableCell>

                  <TableCell sx={TableCellStyle} width="100%">
                    <CustomLink
                      LinkProps={{
                        href: hrefView,
                        style: {
                          margin: '1px',
                          // textDecoration: 'none'  // remove text underline
                        }
                      }}
                      ButtonProps={{
                        fullWidth: true,
                        variant: "text",
                        sx: {
                          // py: 2,
                          justifyContent: 'flex-start',
                          textTransform: 'none' // remove uppercase
                        },
                        onClick: () => setSelectedDatabaseState(database)
                      }}
                    >
                      <Typography component='h6' variant='h6'>{database}</Typography>
                    </CustomLink>
                  </TableCell>

                  {props.show.delete === true && (
                    <TableCell align="right" sx={TableCellStyle}>
                      <DeleteDatabase database={database} />
                    </TableCell>
                  )}
                </TableRow>
              )
            }}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ShowDatabases
