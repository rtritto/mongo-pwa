type DataCumulative = {
  isAuthorized: boolean
  options: import('@/server/config').ConfigOptions
  databases: import('@/server/db').MongoDatabases
  selectedDatabase: string | undefined
  selectedCollection: string | undefined
  selectedDocument: string | undefined
  success: string | undefined
  warning: string | undefined
  error: string | undefined
}

type DataIndex = {
  stats?: ServerStats
} & DataCumulative

type DataDB = {
  title: string
  stats?: DBStats
  collections: import('@/server/db').MongoCollections[string]
  selectedDatabase: string
} & DataCumulative

type DataCollection = {
  title: string
  stats?: CollectionStats
  indexes?: import('mongodb').IndexDescriptionInfo[]
  collections: import('@/server/db').MongoCollections[string]
  selectedDatabase: string
  selectedCollection: string
  docs: Record<string, unknown>[]
  columns: string[]
  count: number
  documentsPerPage: number
  aggregate?: boolean
  query?: string
  projection?: string
} & DataCumulative

type DataDocument = {
  title: string
  docString: string
  _id: string
  subtype?: number
  collections: import('@/server/db').MongoCollections[string]
  selectedDatabase: string
  selectedCollection: string
  selectedDocument: string
} & DataCumulative

type DataLayout = DataIndex | DataDB | DataCollection | DataDocument
