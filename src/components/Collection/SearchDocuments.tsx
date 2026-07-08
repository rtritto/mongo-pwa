import { For, createEffect, createSignal, type Component } from 'solid-js'

import IconSearch from '@/components/Icons/IconSearch'
import SearchAdvanced from './SearchAdvanced'
import SearchSimple from './SearchSimple'

const SearchDocuments: Component<{
  data: DataCollection
}> = (props) => {
  // eslint-disable-next-line solid/reactivity
  const [activeTab, setActiveTab] = createSignal((props.data.query || props.data.projection) ? 1 : 0)

  createEffect(() => {
    setActiveTab((props.data.query || props.data.projection) ? 1 : 0)
  })

  const SEARCH_LABELS = {
    Simple: <SearchSimple data={props.data} />,
    Advanced: <SearchAdvanced data={props.data} />
  }

  return (
    <div class="my-2">
      <div role="tablist" class="tabs-lift tabs tabs-xs">
        <For each={Object.keys(SEARCH_LABELS)}>{(label, index) => (
          <a
            role="tab"
            class={`tab ${activeTab() === index() ? ' tab-active bg-blue-500' : 'bg-neutral-600 hover:bg-blue-300'}`}
            onClick={() => setActiveTab(index())}
          >
            <IconSearch />

            {label}
          </a>
        )}</For>
      </div>

      <div>
        <For each={Object.values(SEARCH_LABELS)}>
          {(content, index) => (
            <div
              role="tabpanel"
              class={`tab-content rounded-r-lg rounded-b-lg bg-zinc-800 px-6 py-4 ${activeTab() === index() ? 'block' : 'hidden'}`}
            >
              {content}
            </div>
          )}
        </For>
      </div>
    </div>

  )
}

export default SearchDocuments
