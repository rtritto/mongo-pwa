import { For, Show, type Component } from 'solid-js'

const MenuList: Component<{ data: DataLayout }> = (props) => {
  // Use DataDocument that contains all properties
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
        <Show when={props.data.selectedDatabase}>
          <a class="btn btn-sm btn-ghost px-1 py-0 mx-0" href={`/db/${encodeURIComponent(props.data.selectedDatabase!)}`}>Database:</a>
        </Show>

        <details id="databases-details" ref={refDatabasesDetails}>
          <Show when={props.data.selectedDatabase} fallback={<summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseCollectionsDetails}>Databases</summary>}>
            <summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseCollectionsDetails}><b>{props.data.selectedDatabase}</b></summary>
          </Show>

          <ul class="p-0 m-0">
            <For each={props.data.databases}>
              {(database) => (
                <li>
                  <a class="w-full" href={`/db/${encodeURIComponent(database)}`} onClick={handleCloseDetails}>{database}</a>
                </li>
              )}
            </For>
          </ul>
        </details>
      </li>

      <Show when={props.data.selectedDatabase}>
        <li class="px-1">
          <Show when={props.data.selectedCollection}>
            <a class="btn btn-sm btn-ghost px-1 py-0 mx-0" href={`/db/${props.data.selectedDatabase}/${encodeURIComponent(props.data.selectedCollection!)}`}>Collection:</a>
          </Show>

          <details id="collections-details" ref={refCollectionsDetails}>
            <Show when={props.data.selectedCollection} fallback={<summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseDatabaseDetails}>Collections</summary>}>
              <summary class="btn btn-sm btn-ghost px-1 py-0 mx-0" onClick={handleClickToCloseDatabaseDetails}><b>{props.data.selectedCollection}</b></summary>
            </Show>

            <ul class="p-0 m-0">
              <For each={props.data.collections}>
                {(collection) => (
                  <li>
                    <a class="w-full" href={`/db/${props.data.selectedDatabase}/${encodeURIComponent(collection)}`} onClick={handleCloseDetails}>{collection}</a>
                  </li>
                )}
              </For>
            </ul>
          </details>
        </li>
      </Show>

      <Show when={props.data.selectedDocument}>
        <li class="disabled">
          <label>Document: <b>{props.data.selectedDocument}</b></label>
        </li>
      </Show>
    </ul>
  )
}

export default MenuList
