import { For, Show, type Component } from 'solid-js'

import { useData } from 'vike-solid/useData'

const handleBlur = () => {
  (document.activeElement as HTMLElement).blur()
}

const MenuList: Component = () => {
  // Use DataDocument that contains all properties
  const [data] = useData<DataDocument>()

  return (
    <ul>
      <li>
        {/* TODO Fix width with large names */}
        <div class="dropdown p-0">
          <Show when={data.selectedDatabase} fallback={<div tabindex="0" role="button" class="btn btn-ghost">Databases</div>}>
            <div class="btn btn-ghost" tabindex="0" role="button">Database: <b>{data.selectedDatabase}</b></div>
          </Show>

          {/* TODO Fix z-index of list that doesn't work */}
          <ul class="dropdown-content menu bg-base-100 rounded-t-none shadow-sm" tabindex="-1">
            <For each={data.databases}>
              {(database) => (
                <li class="w-full">
                  <a href={`/db/${encodeURIComponent(database)}`} onClick={handleBlur}>{database}</a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </li>

      <Show when={data.selectedDatabase}>
        <li>
          {/* TODO Fix width with large names */}
          <div class="dropdown p-0">
            <Show when={data.selectedCollection} fallback={<div tabindex="0" role="button" class="btn btn-ghost">Collections</div>}>
              <div class="btn btn-ghost" tabindex="0" role="button">Collection: <b>{data.selectedCollection}</b></div>
            </Show>

            {/* TODO z-index of list doesn't work */}
            <ul class="dropdown-content menu bg-base-100 rounded-t-none shadow-sm" tabindex="-1">
              <For each={data.collections}>
                {(collection) => (
                  <li class="w-full">
                    <a href={`/db/${data.selectedDatabase}/${encodeURIComponent(collection)}`} onClick={handleBlur}>{collection}</a>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </li>
      </Show>

      <Show when={data.selectedDocument}>
        <li class="disabled">
          {/* TODO disable text decorator underline */}
          <label>Document: <b>{data.selectedDocument}</b></label>
        </li>
      </Show>
    </ul>
  )
}

export default MenuList
