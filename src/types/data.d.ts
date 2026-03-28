type DataIndex = Awaited<ReturnType<typeof import('../pages/index/+data').data>>

type DataDB = Awaited<ReturnType<typeof import('../pages/db/@dbName/+data').data>>

type DataCollection = Awaited<ReturnType<typeof import('../pages/db/@dbName/@collectionName/+data').data>>

type DataDocument = Awaited<ReturnType<typeof import('../pages/db/@dbName/@collectionName/@document/+data').data>>

// (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
type DataLayout = DataIndex | DataDB | DataCollection | DataDocument
