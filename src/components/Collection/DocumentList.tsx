import { For, type Component } from 'solid-js'

import IconSearch from '@/components/Icons/IconSearch'
import JsonViewer from './JsonViewer'

const DocumentList: Component<{ data: DataCollection }> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra text-center">
        <thead>
          <tr>
            <th />
            <For each={props.data.columns}>
              {(column) => (
                <th>{column}</th>
              )}
            </For>
          </tr>
        </thead>

        <tbody>
          <For each={props.data.docs}>
            {(document, index) => (
              <tr>
                <th>
                  <a class="btn btn-sm bg-blue-500" href={`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}/${document._id}`}>
                    <IconSearch />
                  </a>

                  TODO Del {index() + 1}
                </th>

                <For each={props.data.columns}>
                  {(column) => <td><JsonViewer data={document[column]} /></td>}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export default DocumentList
