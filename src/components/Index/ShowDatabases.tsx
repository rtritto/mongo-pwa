import { type Component, For, Show } from 'solid-js'

import IconVisibility from '@/components/Icons/IconVisibility'
import CreateDatabase from './CreateDatabase'
import DeleteDatabase from './DeleteDatabase'

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
            <th class="p-0"><h6><b>Databases</b></h6></th>

            <th />

            <th class="p-0">
              <span class="text-right">
                <Show when={props.show.create}>
                  <CreateDatabase />
                </Show>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <For each={props.databases}>
            {(database) => (
              <tr>
                <td class="p-0.5">
                  <a class="btn bg-green-600" href={`/db/${encodeURIComponent(database)}`}>
                    <IconVisibility />

                    View
                  </a>
                </td>

                <td class="p-0.5">
                  <a class="btn" href={`/db/${encodeURIComponent(database)}`}>
                    <h6>{database}</h6>
                  </a>
                </td>

                <Show when={props.show.delete}>
                  <td class="p-0.5 text-right">
                    <DeleteDatabase database={database} />
                  </td>
                </Show>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default ShowDatabases
