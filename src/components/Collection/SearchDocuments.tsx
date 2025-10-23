import { For, createSignal, type Component } from 'solid-js'

import IconSearch from '@/components/Icons/IconSearch'
import SearchSimple from './SearchSimple'

const SearchDocuments: Component<{
  data: DataCollection
  // setData: SetData
}> = (props) => {
  const [activeTab, setActiveTab] = createSignal(0)

  const SEARCH_LABELS = {
    Simple: <SearchSimple data={props.data} />,
    Advanced: <button>b</button>
  }

  return (
    <div class="my-2">
      <div role="tablist" class="tabs tabs-lift tabs-xs">
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
              class={`tab-content rounded-b-lg rounded-r-lg bg-zinc-800 px-6 py-4 ${activeTab() === index() ? 'block' : 'hidden'}`}
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
