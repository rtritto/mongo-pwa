import type { Component } from 'solid-js'

const getRowsComponent = (fields: ServerStats | DBStats) => {
  const outRaw = []
  for (const cell in fields) {
    outRaw.push([
      <td><strong>{fields[cell as keyof ServerStats & keyof DBStats]!.label}</strong></td>,
      <td>{fields[cell as keyof ServerStats & keyof DBStats]!.value}</td>
    ])
  }
  const out = []
  for (let index = 0, len = outRaw.length; index < len; index += 2) {
    const tableRow = [
      ...outRaw[index]
    ]
    if (index + 1 < len) {
      tableRow.push(...outRaw[index + 1])
    }
    out.push(<tr>{tableRow}</tr>)
  }
  return out
}

const StatsTable: Component<{ label: string, fields: ServerStats | DBStats }> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <td colSpan={4}>
              {/* <h6 component='h6' variant='h6' sx={{ fontWeight: 'bold', pt: 0.5 }}> */}
              <h6><b>{props.label}</b></h6>
            </td>
          </tr>
        </thead>

        <tbody>{getRowsComponent(props.fields)}</tbody>
      </table>
    </div>
  )
}

export default StatsTable
