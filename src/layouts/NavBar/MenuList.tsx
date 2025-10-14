import { For, Show, type Component } from 'solid-js'

import { useData } from 'vike-solid/useData'

const closeDropdown = (detailsRef: HTMLDetailsElement) => {
  detailsRef.removeAttribute('open') // Manually close the dropdown
}

const MenuList: Component = () => {
  let detailsDBRef!: HTMLDetailsElement
  let detailsCollectionRef!: HTMLDetailsElement

  // Use DataDocument that contains all properties
  const [data] = useData<DataDocument>()

  return (
    <ul>
      <li>
        {/* TODO Fix width with large names */}
        <details ref={detailsDBRef}>
          <Show when={data?.selectedDatabase} fallback={<summary class="btn btn-ghost">Databases</summary>}>
            <summary class="btn btn-ghost">Database: <b>{data.selectedDatabase}</b></summary>
          </Show>

          {/* TODO Fix z-index of list that doesn't work */}
          <ul class="bg-base-100 rounded-t-none z-2 shadow-sm">
            <For each={data?.databases}>
              {(database) => (
                <li class="block w-full">
                  <a href={`/db/${encodeURIComponent(database)}`} onClick={() => closeDropdown(detailsDBRef)}>{database}</a>
                </li>
              )}
            </For>
          </ul>
        </details>
      </li>

      <Show when={data?.selectedDatabase}>
        <li>
          {/* TODO Fix width with large names */}
          <details ref={detailsCollectionRef}>
            <Show when={data.selectedCollection} fallback={<summary class="btn btn-ghost">Collections</summary>}>
              <summary class="btn btn-ghost">Collection: <b>{data.selectedCollection}</b></summary>
            </Show>

            {/* TODO z-index of list doesn't work */}
            <ul class="bg-base-100 rounded-t-none z-2 shadow-sm">
              <For each={data.collections}>
                {(collection) => (
                  <li class="block w-full">
                    <a href={`/db/${data.selectedDatabase}/${encodeURIComponent(collection)}`} onClick={() => closeDropdown(detailsCollectionRef)}>{collection}</a>
                  </li>
                )}
              </For>
            </ul>
          </details>
        </li>
      </Show>

      <Show when={data?.selectedDocument}>
        <li class="disabled">
          {/* TODO disable text decorator underline */}
          <label>Document: <b>{data.selectedDocument}</b></label>
        </li>
      </Show>
    </ul>
  )
}

export default MenuList
