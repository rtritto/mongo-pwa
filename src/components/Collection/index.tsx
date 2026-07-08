import { createPagination } from '@solid-primitives/pagination'
import { type Component, createEffect, createSignal, For, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { navigate, reload } from 'vike-lite/client/router'
import { useData, useUrl } from 'vike-lite-solid'

import Alerts from '@/components/common/Alerts'
import buildQuery from '@/components/common/functions/buildQuery'
import DeleteDialog from '@/components/common/DeleteDialog'
import ExportCollectionButton from '@/components/common/ExportCollectionButton'
import ImportCollectionButton from '@/components/common/ImportCollectionButton'
import CompactCollectionButton from './CompactCollectionButton'
import StatsTable from '@/components/common/StatsTable'
import handleFetchError from '@/components/common/functions/handleFetchError'
import SearchDocuments from './SearchDocuments'
import DocumentList from './DocumentList'
import IndexTable from './IndexTable'
import SaveDialog from './SaveDialog'
import RenameCollection from './RenameCollection'
import { getInitialColumnsHeader, getNextSort, removeColumnFromSortQp } from './functions/functionsSort'
import { HEADERS_JSON } from '@/utils/constants'
import fetchWithRetries from '@/utils/fetchWithRetries'

const DOC_STRING_TEMPLATE_DOCUMENT = `{
  _id: ObjectId()
}`
const DOC_STRING_TEMPLATE_INDEX = `{
  key: 1
}`

const getLastPage = (pageSize: number, totalCount: number): number => {
  return Math.ceil(totalCount / pageSize)
}

const CollectionPage: Component<DataCollection> = () => {
  const url = useUrl()
  const search = Object.fromEntries(new URLSearchParams(url().search))
  const [data, setData] = useData<DataCollection>()
  const [columnsHeader, setColumnsHeader] = createStore<ColumnsHeader>(getInitialColumnsHeader(data.columns, search))

  //#region Pagination
  const [pages, setPages] = createSignal<number>(getLastPage(data.documentsPerPage, data.count))
  const [paginationProps, page, setPage] = createPagination(() => ({
    pages: pages(),
    initialPage: 'page' in search ? Number(search.page) : 1,
    firstContent: '«',
    lastContent: '»',
    nextContent: '›',
    prevContent: '‹'
  }))

  createEffect(() => {
    setPages(getLastPage(data.documentsPerPage, data.count))
  })

  const handleSortClick = (column: string): { newSort: string; nextSort: boolean | null } => {
    const nextSort = getNextSort(columnsHeader[column])
    const newSortQp = nextSort === true ? column : (nextSort === false ? `-${column}` : '')
    // Remove existing sort for current column
    const finalSortQp = []
    if (search.sort) {
      const cleanSortQp = removeColumnFromSortQp(search.sort, column)
      if (cleanSortQp) {
        finalSortQp.push(cleanSortQp)
      }
    }
    if (newSortQp) {
      finalSortQp.push(newSortQp)
    }

    return {
      newSort: finalSortQp.join(','),
      nextSort
    }
  }

  const doQuery = async ({ page, sort, column, isBackForwardNavigation = false }: DoQueryParams) => {
    // TODO add Component with id back-to-top-anchor
    // goToTopPage
    // document.querySelector('#back-to-top-anchor')!.scrollIntoView({ behavior: 'smooth', block: 'center' })
    let nextSort: boolean | null
    const query = {
      ...search,
      ...page && { page }
    } as QueryParameter
    if (sort || column) {
      if (sort) {
        query.sort = sort
      } else {
        const newNextSorts = handleSortClick(column!)
        query.sort = newNextSorts.newSort
        nextSort = newNextSorts.nextSort
      }
      if (!query.sort) {
        // newNextSorts.nextSort results is empty,
        // delete here to be more solid
        delete query.sort
      }
    } else {
      delete query.sort
    }

    const res = await fetchWithRetries('/api/pageDocument', {
      method: 'POST',
      body: JSON.stringify({
        database: data.selectedDatabase,
        collection: data.selectedCollection,
        ...query
      }),
      headers: HEADERS_JSON(data.options)
    })
    const { count, columns, docs } = await res!.json()
    if (page) {
      setPage(page)
    }
    setData('count', count)
    setData('columns', columns)
    setData('docs', docs)
    if (page && column) {
      setColumnsHeader(column, nextSort!)
    } else {
      // When navigating to a new page, columns could be different, so reset columns in Header
      setColumnsHeader(getInitialColumnsHeader(columns, query))
    }

    if (!isBackForwardNavigation) {
      // Update route path (no reload)
      const search = buildQuery(query)
      const newUrl = `/db/${data.selectedDatabase}/${data.selectedCollection}${search ? `?${search}` : ''}`
      navigate(newUrl, { pageContext: { search } })
    }
  }

  onMount(() => {
    // Navigation triggered by our history.pushState() call
    globalThis.addEventListener('popstate', async () => {
      // Only handle navigation triggered (added by navigate function
      // to history like pushState that uses
      // globalThis.history.state.triggeredBy by user) by vike-lite
      if (globalThis.history.state.triggeredBy === 'vike-navigate') {
        const urlParams = new URLSearchParams(globalThis.location.search)
        // Implement back- and forward navigation
        await doQuery({
          ...urlParams.has('page') && { page: Number(urlParams.get('page')) },
          sort: urlParams.get('sort'),
          isBackForwardNavigation: true
        })
      }
    })
  })

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
                  await doQuery({
                    page: paginationProps.page!,
                    sort: search.sort
                  })
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

  const handleSaveAddDocument = async (doc: string, dialogRef: HTMLDialogElement) => {
    const response = await handleFetchError(
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
    )
    if (response) {
      const { insertedId } = await response.json() as { insertedId: string }
      dialogRef.close()
      await reload()
      setData('success', `Document "${insertedId}" added!`)
    }
  }

  const handleSaveAddIndex = async (doc: string, dialogRef: HTMLDialogElement) => {
    const response = await handleFetchError(
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
    )
    if (response) {
      dialogRef.close()
      const { indexName } = await response.json() as { indexName: string }
      await reload()
      setData('success', `Index "${indexName}" created!`)
    }
  }

  const handleSaveDeleteAllDocuments = async () => {
    await handleFetchError(
      fetch('/api/collectionDelete', {
        method: 'POST',
        headers: HEADERS_JSON(data.options),
        body: JSON.stringify({
          database: data.selectedDatabase,
          collection: data.selectedCollection,
          query: {
            key: search.key,
            value: search.value,
            type: search.type,
            query: search.query
          }
        })
      }),
      setData
    )
    await reload()
  }

  const handleSaveDeleteCollection = async () => {
    await handleFetchError(
      fetch('/api/collectionDelete', {
        method: 'POST',
        headers: HEADERS_JSON(data.options),
        body: JSON.stringify({ database: data.selectedDatabase, collection: data.selectedCollection })
      }),
      setData,
      (() => {
        // Remove database from global database to update viewing databases
        const indexToRemove = data.collections.indexOf(data.selectedCollection)
        return {
          collections: [
            ...data.collections.slice(0, indexToRemove),
            ...data.collections.slice(indexToRemove + 1)
          ],
          success: `Collection "${data.selectedCollection}" deleted!`
        }
      })()
    )
    navigate(`/db/${data.selectedDatabase}`)
  }

  return (
    <div>
      {/* (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833 */}
      <Alerts data={data} />

      <h1 class="pb-2 text-2xl">Viewing Collection: <b>{data.selectedCollection}</b></h1>

      <SearchDocuments data={data} />

      <Show when={!data.options.readOnly}>
        <div class="my-1 flex">
          <div class="mr-2">
            <SaveDialog
              title="Add Document"
              label="New Document"
              template={DOC_STRING_TEMPLATE_DOCUMENT}
              handleSave={handleSaveAddDocument}
            />
          </div>

          <div class="mr-2">
            <SaveDialog
              title="Add Index"
              message="A document that contains the field and value pairs where the field is the index key. 1 for an ascending and -1 for a descending index."
              label="New Index"
              template={DOC_STRING_TEMPLATE_INDEX}
              handleSave={handleSaveAddIndex}
            />
          </div>
        </div>

        <div class="my-2">
          <DeleteDialog
            title="Delete All Documents"
            message={`Are you sure you want to delete all ${data.count} documents?`}
            label={`Delete all ${data.count} documents retrieved`}
            handleDelete={handleSaveDeleteAllDocuments}
          />
        </div>
      </Show>

      <PaginationBoxComponent />

      <div class="my-2 overflow-x-auto rounded-box border border-base-300">
        <DocumentList
          columnsHeader={columnsHeader}
          doQuery={doQuery}
          data={data}
          setData={setData}
        />
      </div>

      <PaginationBoxComponent />

      <Show when={!data.options.readOnly}>
        <RenameCollection data={data} setData={setData} />
      </Show>

      <table class="table">
        <thead>
          <tr>
            <td>
              <h6><b>Operations</b></h6>
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <Show when={!data.options.noExport}>
              <td class="p-0.5">
                <ExportCollectionButton
                  label="Export JSON"
                  url="/api/collectionExport"
                  collection={data.selectedCollection}
                  query={search}
                  data={data}
                  setData={setData}
                />
              </td>

              <td class="p-0.5">
                <ExportCollectionButton
                  label="Export CSV"
                  url="/api/collectionExportCsv"
                  collection={data.selectedCollection}
                  query={search}
                  data={data}
                  setData={setData}
                />
              </td>
            </Show>

            <td class="p-0.5">
              <ImportCollectionButton collection={data.selectedCollection} data={data} setData={setData} />
            </td>

            <Show when={!data.options.readOnly}>
              <td class="p-0.5">
                <CompactCollectionButton collection={data.selectedCollection} data={data} setData={setData} />
              </td>
            </Show>

            <Show when={!data.options.noDelete}>
              <td class="p-0.5">
                <DeleteDialog
                  title="Delete Collection"
                  message="Be careful! You are about to delete the collection (all documents will be deleted)"
                  value={data.selectedCollection}
                  label="Delete"
                  fullWidth
                  enableInput
                  handleDelete={handleSaveDeleteCollection}
                />
              </td>
            </Show>
          </tr>
        </tbody>
      </table>

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
          <div class="my-2 overflow-x-auto rounded-box border border-base-300">
            <StatsTable label="Collection Stats" fields={data.stats} />
          </div>

          <div class="my-2 overflow-x-auto rounded-box border border-base-300">
            <IndexTable data={data} setData={setData} />
          </div>
        </Show>
      </div>
    </div>
  )
}

export default CollectionPage
