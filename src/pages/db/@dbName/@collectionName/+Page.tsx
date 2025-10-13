import { createPagination } from '@solid-primitives/pagination'
import { type Component, type JSX, createEffect, createSignal, For, Show } from 'solid-js'
import { useData } from 'vike-solid/useData'
import { reload } from 'vike/client/router'

import DeleteDialog from '@/components/common/DeleteDialog'
import DocumentList from '@/components/Collection/DocumentList'
import StatsTable from '@/components/common/StatsTable'
import CreateDocumentDialog from '@/components/Collection/CreateDocumentDialog'
import { HEADERS_JSON } from '@/utils/constants'
import fetchWithRetries from '@/utils/fetchWithRetries'
import { getLastPage } from '@/utils/queries'

const docStringTemplate = `{
  _id: ObjectId()
}`

const Page: Component<DataCollection> = () => {
  const [data, setData] = useData<DataCollection>()
  const [alertSuccessMessage, setAlertSuccessMessage] = createSignal<JSX.Element>()

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
    const { count, columns, docs } = await res!.json()
    setData('count', count)
    setData('columns', columns)
    setData('docs', docs)
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

      <Show when={alertSuccessMessage()}>
        <div role="alert" class="alert alert-success alert-outline mb-2">
          {alertSuccessMessage()}
        </div>
      </Show>

      <div class="my-2">
        <CreateDocumentDialog
          title="Add Document"
          label="New Document"
          template={docStringTemplate}
          handleSave={(doc: string, dialogRef: HTMLDialogElement) => (
            fetch('/api/documentCreate', {
              method: 'POST',
              headers: HEADERS_JSON,
              body: JSON.stringify({
                database: data.selectedDatabase,
                collection: data.selectedCollection,
                doc
              })
            }).then(async (res) => {
              if (res.ok) {
                const { insertedId } = await res.json() as { insertedId: string }
                reload()
                setAlertSuccessMessage(<span>Document "<b>{insertedId}</b>" added!</span>)
                dialogRef.close()
              } else {
                // const { error } = await res.json()
                // setError(error)
              }
            })
            // .catch((error) => { setError(error.message) })
          )}
        />
      </div>

      <div class="my-2">
        <DeleteDialog
          title="Delete All Documents"
          message={`Are you sure you want to delete all ${data.count} documents?`}
          label={`Delete all ${data.count} documents retrieved`}
          handleDelete={() => fetch('/api/collectionDelete', {
            method: 'POST',
            headers: HEADERS_JSON,
            body: JSON.stringify({
              database: data.selectedDatabase,
              collection: data.selectedCollection,
              query: {
                key: data.search.key,
                value: data.search.value,
                type: data.search.type,
                query: data.search.query
              }
            })
          }).then(async () => {
            await reload()
          })}
        />
      </div>

      <PaginationBoxComponent />

      <DocumentList data={data} />

      <PaginationBoxComponent />

      <div class="my-2">
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
    </div >
  )
}

export default Page
