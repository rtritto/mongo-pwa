type Messages = {
  success?: string
  warning?: string
  error?: string
}

type DataIndex = Omit<
  Awaited<ReturnType<typeof import('../pages/index/+data').data>>,
  keyof Messages
> & Messages & { isAuthorized: boolean }

type DataDB = Omit<
  Awaited<ReturnType<typeof import('../pages/db/@dbName/+data').data>>,
  keyof Messages
> & Messages & { isAuthorized: boolean }

type DataCollection = Omit<
  Awaited<ReturnType<typeof import('../pages/db/@dbName/@collectionName/+data').data>>,
  keyof Messages
> & Messages & { isAuthorized: boolean }

type DataDocument = Omit<
  Awaited<ReturnType<typeof import('../pages/db/@dbName/@collectionName/@document/+data').data>>,
  keyof Messages
> & Messages & { isAuthorized: boolean }

// (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
type DataLayout = DataIndex | DataDB | DataCollection | DataDocument
