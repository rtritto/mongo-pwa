import { createPagination } from '@solid-primitives/pagination'
import { type Component, createEffect, createSignal, For, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'

import DocumentList from '@/components/Collection/DocumentList'
import StatsTable from '@/components/common/StatsTable'
import CreateDocumentDialog from '@/components/Collection/CreateDocumentDialog'
import { HEADERS_JSON } from '@/utils/constants'
import fetchWithRetries from '@/utils/fetchWithRetries'
import { getLastPage } from '@/utils/queries'

const Page: Component<DataCollection> = () => {
  const [data, setData] = useData<DataCollection>()
  const [idDocumentCreated, setIdDocumentCreated] = createSignal('')

  //#region Pagination
  const [pages, setPages] = createSignal<number>(getLastPage(data.documentsPerPage, data.count))
  const [paginationProps, page, setPage] = createPagination(() => ({
    pages: pages(),
    initialPage: 'page' in data.search ? Number(data.search.page) : 1
  }))

  createEffect(() => {
    setPages(getLastPage(data.documentsPerPage, data.count))
  })

  const doQuery = async (data: DataCollection, page: number) => {
    // TODO add Component with id back-to-top-anchor
    // goToTopPage
    // document.querySelector('#back-to-top-anchor')!.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Update route path (no reload)
    globalThis.history.replaceState(null, '', `/db/${data.selectedDatabase}/${data.selectedCollection}?page=${page}`)

    const res = await fetchWithRetries('/api/pageDocument', {
      method: 'POST',
      body: JSON.stringify({
        database: data.selectedDatabase,
        collection: data.selectedCollection,
        ...data.search,
        page
      }),
      headers: HEADERS_JSON
    })
    const { items, count } = await res!.json()
    setData('docs', items)
    setData('count', count)
  }

  const PaginationBoxComponent: Component = () => (
    <Show when={pages() !== 1}>
      <div class="flex justify-center p-1.5">
        <div class="flex">
          <For each={paginationProps()}>
            {(paginationProps) => (
              <button
                // TODO improve vertical align of button contents or change button contents to icons
                class="btn btn-sm"
                disabled={page() === paginationProps.page}
                onClick={async () => {
                  setPage(paginationProps.page!)
                  await doQuery(data, page())
                }}
              >
                {paginationProps.children}
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  )
  //#endregion

  return (
    <div>
      <h1 class="text-2xl pb-2">Viewing Collection: <b>{data.selectedCollection}</b></h1>

      <Show when={idDocumentCreated()}>
        <div role="alert" class="alert alert-success alert-outline mb-2">
          <span>Document "<b>{idDocumentCreated()}</b>" added!</span>
        </div>
      </Show>

      <CreateDocumentDialog database={data.selectedDatabase} collection={data.selectedCollection} setIdDocumentCreated={setIdDocumentCreated} />

      <PaginationBoxComponent />

      <DocumentList data={data} />

      <PaginationBoxComponent />

      <div class="mb-2">
        <Show
          when={data.stats}
          fallback={(
            <>
              <h4>Collection Stats</h4>
              Turn on admin in <b>config.js</b> to view collection stats!
            </>
          )}
        >
          <StatsTable label="Collection Stats" fields={data.stats! as DBStats} />
        </Show>
      </div>
    </div>
  )
}

export default Page
