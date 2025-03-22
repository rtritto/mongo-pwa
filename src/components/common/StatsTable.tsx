import type { Component } from 'solid-js'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@suid/material'

const getRowsComponent = (fields: Fields) => {
  const outRaw = []
  for (const cell in fields) {
    outRaw.push([
      <TableCell>
        <strong>{fields[cell].label}</strong>
      </TableCell>,
      <TableCell>
        {fields[cell].value}
      </TableCell>
    ])
  }
  const out = []
  for (let index = 0, length_ = outRaw.length; index < length_; index += 2) {
    const tableRow = [
      ...outRaw[index]
    ]
    if (index + 1 < length_) {
      tableRow.push(...outRaw[index + 1])
    }
    out.push(
      <TableRow>
        {tableRow}
      </TableRow>
    )
  }
  return out
}

const StatsTable: Component<{ label: string, fields: Fields }> = (props) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>
              <Typography component='h6' variant='h6' sx={{ fontWeight: 'bold', pt: 0.5 }}>
                {props.label}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {getRowsComponent(props.fields)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default StatsTable
