import { type Component, For, Show } from 'solid-js'

import IconVisibility from '@/components/Icons/IconVisibility'
import CreateDatabase from './CreateDatabase'
// import DeleteDatabase from './DeleteDatabase'

const ShowDatabases: Component<{
  databases: Mongo['databases']
  show: {
    create: boolean
    delete: boolean
  }
}> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            {/* <TableCell sx={{ borderRight: 'none', p: 1.5 }}> */}
            <th class="p-1.5"><h6><b>Databases</b></h6></th>

            {/* <TableCell sx={{ px: 1.5, borderLeft: 'none' }} align="right" colSpan={2}> */}
            <th class="col-span-2 p-1.5 text-right">
              <Show when={props.show.create}>
                {/* TODO */}
                <CreateDatabase />
              </Show>
            </th>
          </tr>
        </thead>

        <tbody>
          <For each={props.databases}>
            {(database) => (
              <tr>
                <td class="p-0.5">
                  <a class="btn" href={`/db/${encodeURIComponent(database)}`}>
                    <IconVisibility />

                    View
                  </a>
                </td>

                <td class="p-0.5">
                  <a class="btn" href={`/db/${encodeURIComponent(database)}`}>
                    <h6>{database}</h6>
                  </a>
                </td>

                {/* TODO */}
                {/* <Show when={props.show.delete}>
                    <td class="p-0.5 text-right">
                      <DeleteDatabase database={database} />
                    </td>
                  </Show> */}
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default ShowDatabases
