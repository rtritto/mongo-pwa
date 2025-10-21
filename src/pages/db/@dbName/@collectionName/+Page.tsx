import { createPagination } from '@solid-primitives/pagination'
import { type Component, createEffect, createSignal, For, Show } from 'solid-js'
import { reload } from 'vike/client/router'
import { useData } from 'vike-solid/useData'

import Alerts from '@/components/common/Alerts'
import DeleteDialog from '@/components/common/DeleteDialog'
import StatsTable from '@/components/common/StatsTable'
import handleFetchError from '@/components/common/handleFetchError'
import DocumentList from '@/components/Collection/DocumentList'
import IndexTable from '@/components/Collection/IndexTable'
import SaveDialog from '@/components/Collection/SaveDialog'
import { HEADERS_JSON } from '@/utils/constants'
import fetchWithRetries from '@/utils/fetchWithRetries'
import { getLastPage } from '@/utils/queries'

const docStringTemplate_Document = `{
  _id: ObjectId()
}`
const docStringTemplate_Index = `{
  key: 1
}`

const Page: Component<DataCollection> = () => {
  const [data, setData] = useData<DataCollection>()

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
      headers: HEADERS_JSON(data.options)
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
      {/* (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833 */}
      <Alerts data={data} />

      <h1 class="text-2xl pb-2">Viewing Collection: <b>{data.selectedCollection}</b></h1>

      <div class="flex my-1">
        <div class="mr-2">
          <SaveDialog
            title="Add Document"
            label="New Document"
            template={docStringTemplate_Document}
            handleSave={(doc: string, dialogRef: HTMLDialogElement) => handleFetchError(
              fetch('/api/documentCreate', {
                method: 'POST',
                headers: HEADERS_JSON(data.options),
                body: JSON.stringify({
                  database: data.selectedDatabase,
                  collection: data.selectedCollection,
                  doc
                })
              }),
              setData
            ).then(async (response) => {
              if (response) {
                const { insertedId } = await response.json() as { insertedId: string }
                dialogRef.close()
                await reload()
                setData('success', `Document "${insertedId}" added!`)
              }
            })}
          />
        </div>

        <div class="mr-2">
          <SaveDialog
            title="Add Index"
            message="A document that contains the field and value pairs where the field is the index key. 1 for an ascending and -1 for a descending index."
            label="New Index"
            template={docStringTemplate_Index}
            handleSave={(doc: string, dialogRef: HTMLDialogElement) => handleFetchError(
              fetch('/api/collectionCreateIndex', {
                method: 'POST',
                headers: HEADERS_JSON(data.options),
                body: JSON.stringify({
                  database: data.selectedDatabase,
                  collection: data.selectedCollection,
                  doc
                })
              }),
              setData
            ).then(async (response) => {
              if (response) {
                dialogRef.close()
                const { indexName } = await response.json() as { indexName: string }
                await reload()
                setData('success', `Index "${indexName}" created!`)
              }
            })}
          />
        </div>
      </div>

      <div class="my-2">
        <DeleteDialog
          title="Delete All Documents"
          message={`Are you sure you want to delete all ${data.count} documents?`}
          label={`Delete all ${data.count} documents retrieved`}
          handleDelete={() => handleFetchError(
            fetch('/api/collectionDelete', {
              method: 'POST',
              headers: HEADERS_JSON(data.options),
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
            }),
            setData
          ).then(async () => {
            await reload()
          })}
        />
      </div>

      <PaginationBoxComponent />

      <DocumentList data={data} setData={setData} />

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
          <StatsTable label="Collection Stats" fields={data.stats} />

          <IndexTable
            database={data.selectedDatabase}
            collection={data.selectedCollection}
            label="Indexes"
            fields={data.indexes!}
            options={data.options}
            show={{
              create: !data.options.readOnly,
              delete: !data.options.noDelete && !data.options.readOnly
            }}
            setData={setData}
          />
        </Show>
      </div>
    </div>
  )
}

export default Page
