// (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
type DataLayout = {
  options: Options
}

type DataIndex = {
  title: string
  databases: Mongo['databases']
  options: Options

  stats?: ServerStats

  success?: string
  error?: string
}

type DataDB = Omit<DataIndex, 'stats'> & {
  dbName: string
  collections: Mongo['collections'][string]

  selectedDatabase: string
  // set undefined when navigating from another page to db page
  selectedCollection: undefined
  // set undefined when navigating from another page to db page
  selectedDocument: undefined
  stats?: DBStats
}

type DataCollection = Omit<DataDB, 'stats' | 'selectedCollection'> & {
  collectionName: string

  selectedCollection: string
  // set undefined when navigating from another page to collection page
  selectedDocument: undefined

  docs: Record<string, any>[]
  columns: string[]
  search: QueryParameter
  count: number
  documentsPerPage: number
  stats?: CollectionStats
  indexes?: Index[]
}

type DataDocument = Omit<DataCollection, 'selectedDocument'> & {
  documentName: string
  docString: string
  _id: any
  subtype: number | undefined

  selectedDocument: string
  readOnly: boolean
}
