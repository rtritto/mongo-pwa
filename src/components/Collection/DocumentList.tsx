import { For, type Component } from 'solid-js'

import IconSearch from '@/components/Icons/IconSearch'
import DeleteDocument from './DeleteDocument'
import JsonViewer from './JsonViewer'

const DocumentList: Component<{
  data: DataCollection
}> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
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
            {(document) => (
              <tr>
                <th>
                  <div class="my-2">
                    <a
                      class="btn btn-sm w-full bg-blue-500"
                      href={`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}/${document._id}${document.sub_type === undefined ? '' : `?subtype=${document.sub_type}`}`}
                    >
                      <IconSearch />
                    </a>
                  </div>

                  <div class="my-2">
                    <DeleteDocument
                      database={props.data.selectedDatabase}
                      collection={props.data.selectedCollection}
                      _id={document._id}
                      sub_type={document.sub_type}
                      doReload={true}
                      fullWidth={true}
                    />
                  </div>
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
