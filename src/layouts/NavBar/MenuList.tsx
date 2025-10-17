import { For, Show, type Component } from 'solid-js'
import { useData } from 'vike-solid/useData'

const MenuList: Component = () => {
  // Use DataDocument that contains all properties
  const [data] = useData<DataDocument>()

  let refDatabasesDetails: HTMLDetailsElement | undefined
  let refCollectionsDetails: HTMLDetailsElement | undefined

  const handleCloseDetails = () => {
    refDatabasesDetails?.removeAttribute('open')
    refCollectionsDetails?.removeAttribute('open')
  }

  const handleClickToCloseDatabaseDetails = () => {
    refDatabasesDetails?.removeAttribute('open')
  }
  const handleClickToCloseCollectionsDetails = () => {
    refCollectionsDetails?.removeAttribute('open')
  }

  return (
    <ul class="menu menu-horizontal px-1 py-0">
      <li class="px-1">
        <Show when={data.selectedDatabase}>
          <a class="btn btn-sm btn-ghost px-1 py-0 mx-0" href={`/db/${encodeURIComponent(data.selectedDatabase)}`}>Database:</a>
        </Show>

        <details id="databases-details" ref={refDatabasesDetails}>
          <Show when={data.selectedDatabase} fallback={<summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseCollectionsDetails}>Databases</summary>}>
            <summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseCollectionsDetails}><b>{data.selectedDatabase}</b></summary>
          </Show>

          <ul class="p-0 m-0">
            <For each={data.databases}>
              {(database) => (
                <li>
                  <a class="w-full" href={`/db/${encodeURIComponent(database)}`} onClick={handleCloseDetails}>{database}</a>
                </li>
              )}
            </For>
          </ul>
        </details>
      </li>

      <Show when={data.selectedDatabase}>
        <li class="px-1">
          <Show when={data.selectedCollection}>
            <a class="btn btn-sm btn-ghost px-1 py-0 mx-0" href={`/db/${data.selectedDatabase}/${encodeURIComponent(data.selectedCollection)}`}>Collection:</a>
          </Show>

          <details id="collections-details" ref={refCollectionsDetails}>
            <Show when={data.selectedCollection} fallback={<summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseDatabaseDetails}>Collections</summary>}>
              <summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseDatabaseDetails}><b>{data.selectedCollection}</b></summary>
            </Show>

            <ul class="p-0 m-0">
              <For each={data.collections}>
                {(collection) => (
                  <li>
                    <a class="w-full" href={`/db/${data.selectedDatabase}/${encodeURIComponent(collection)}`} onClick={handleCloseDetails}>{collection}</a>
                  </li>
                )}
              </For>
            </ul>
          </details>
        </li>
      </Show>

      <Show when={data.selectedDocument}>
        <li class="disabled">
          <label>Document: <b>{data.selectedDocument}</b></label>
        </li>
      </Show>
    </ul>
  )
}

export default MenuList
