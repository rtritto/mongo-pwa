import { For, Show, type Component } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike-lite/client/router'

import DeleteDocument from './DeleteDocument'
import JsonViewer from './JsonViewer'

const DocumentList: Component<{
  columnsHeader: ColumnsHeader
  doQuery: (doQueryParams: DoQueryParams) => Promise<void>
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  // Prevent auto-scroll
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 1) e.preventDefault()
  }

  return (
    <table class="table table-zebra">
      <thead>
        <tr>
          <th />

          <For each={props.data.columns}>
            {(column) => (
              <th title={`Sort by ${column}`}>
                <Show
                  when={props.columnsHeader[column] === null}
                  fallback={(
                    <ul class="menu w-full p-0">
                      <li>
                        <details open={props.columnsHeader[column]!} class="w-full">
                          <summary
                            class="btn w-full btn-ghost btn-sm"
                            onClick={async (element) => {
                              await props.doQuery({ column })
                              element.target.parentElement!.removeAttribute('open')
                            }}
                          >
                            <b>{column}</b>
                          </summary>
                        </details>
                      </li>
                    </ul>
                  )}
                >
                  <button
                    class="btn w-full btn-ghost btn-sm"
                    onClick={async () => await props.doQuery({ column })}
                  >
                    <b>{column}</b>
                  </button>
                </Show>
              </th>
            )}
          </For>
        </tr>
      </thead>

      <tbody>
        <For each={props.data.docs}>
          {(document) => {
            const docUrl = `/db/${props.data.selectedDatabase}/${props.data.selectedCollection}/${document._id}${document.sub_type === undefined ? '' : `?subtype=${document.sub_type}`}`

            const handleRowClick = async (e: MouseEvent) => {
              if (e.target === e.currentTarget) {
                if (e.ctrlKey || e.metaKey || e.button === 1) {
                  // Open in new tab on Ctrl/Cmd+Click or Middle-Click
                  window.open(docUrl, '_blank')
                } else if (e.button === 0) {
                  // Navigate in current tab on normal left click
                  await navigate(docUrl)
                }
              }
            }
            return (
              <tr>
                <th
                  class="cursor-pointer"
                  onClick={handleRowClick}
                  onAuxClick={handleRowClick}
                  onMouseDown={handleMouseDown}
                >
                  <div class="my-1">
                    <DeleteDocument
                      data={props.data}
                      setData={props.setData}
                      _id={document._id}
                      sub_type={document.sub_type}
                      doReload
                      fullWidth
                    />
                  </div>
                </th>

                <For each={props.data.columns}>
                  {(column) => (
                    <td
                      class="cursor-pointer"
                      onClick={handleRowClick}
                      onAuxClick={handleRowClick}
                      onMouseDown={handleMouseDown}
                    >
                      <JsonViewer value={document[column]} />
                    </td>
                  )}
                </For>
              </tr>
            )
          }}
        </For>
      </tbody>
    </table>
  )
}

export default DocumentList
