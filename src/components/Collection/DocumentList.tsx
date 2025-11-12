import { For, Show, type Component } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'
import { navigate } from 'vike/client/router'

import DeleteDocument from './DeleteDocument'
import JsonViewer from './JsonViewer'

/* Sort initial order: ascending (true) | descending (false) | none (null) */
const getInitialColumnsHeader = (columns: string[], query: QueryParameter) => {
  const header: { [key: string]: boolean | null } = {}

  for (const column of columns) {
    header[column] = null
  }

  if (query.sort) {
    const splittedSort = query.sort.split(',')
    for (const sortParam of splittedSort) {
      if (sortParam[0] === '-') {
        header[sortParam.slice(1)] = false
      } else {
        header[sortParam] = true
      }
    }
  }

  return header
}

/* Sort order: ascending (true) > descending (false) > none (null) > ascending (true) */
const getNextSort = (columnHeader: boolean | null) => {
  switch (columnHeader) {
    case null: {
      return true
    }
    case true: {
      return false
    }
  }
  return null
}

const removeColumnFromSortQp = (sortQp: string, column: string) => {
  return sortQp.split(',').filter((col) => {
    const cleanCol = col.replace(/^-/, '')
    return cleanCol !== column
  }).join(',')
}

const DocumentList: Component<{
  query: QueryParameter
  doQuery: (data: DataCollection, page: number | null, sort: string) => Promise<void>
  data: DataCollection
  setData: SetStoreFunction<any>
}> = (props) => {
  const [columnsHeader, setColumnsHeader] = createStore(getInitialColumnsHeader(props.data.columns, props.query))

  const handleSortClick = async (column: string) => {
    const newSort = getNextSort(columnsHeader[column])
    const { sort } = props.query
    const newSortQp = newSort === true ? column : (newSort === false ? `-${column}` : '')
    // Remove existing sort for current column
    let finalSortQp: string
    if (sort) {
      const cleanSortQp = removeColumnFromSortQp(sort, column)
      finalSortQp = cleanSortQp ? `${cleanSortQp},${newSortQp}` : newSortQp
    } else {
      finalSortQp = newSortQp
    }
    setColumnsHeader(column, newSort)
    await props.doQuery(props.data, null, finalSortQp)
  }

  return (
    <table class="table table-zebra">
      <thead>
        <tr>
          <th />

          <For each={props.data.columns}>
            {(column) => (
              <th title={`Sort by ${column}`}>
                <ul class={`${columnsHeader[column] === null ? '' : 'menu '}px-1 py-0`}>
                  <li class="px-1">
                    <Show
                      when={columnsHeader[column] === null}
                      fallback={(
                        <details open={columnsHeader[column]!}>
                          <summary
                            class="btn btn-sm btn-ghost w-full px-1 py-0 mx-0"
                            onClick={async () => await handleSortClick(column)}
                          >
                            <b>{column}</b>
                          </summary>
                        </details>
                      )}
                    >
                      <button
                        class="btn btn-sm btn-ghost w-full px-1 py-0 mx-0"
                        onClick={async () => await handleSortClick(column)}
                      >
                        <b>{column}</b>
                      </button>
                    </Show>
                  </li>
                </ul>
              </th>
            )}
          </For>
        </tr>
      </thead>

      <tbody>
        <For each={props.data.docs}>
          {(document) => (
            <tr>
              <th
                class="cursor-pointer"
                onClick={async (e) => {
                  if (e.target === e.currentTarget) {
                    await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}/${document._id}${document.sub_type === undefined ? '' : `?subtype=${document.sub_type}`}`)
                  }
                }}
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
                    onClick={async (e) => {
                      if (e.target === e.currentTarget) {
                        await navigate(`/db/${props.data.selectedDatabase}/${props.data.selectedCollection}/${document._id}${document.sub_type === undefined ? '' : `?subtype=${document.sub_type}`}`)
                      }
                    }}
                  >
                    <JsonViewer value={document[column]} />
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

export default DocumentList
