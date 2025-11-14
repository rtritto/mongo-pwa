type DataIndex = {
  title: string
  databases: Mongo['databases']
  options: Options

  // set undefined when navigating from another page
  selectedDatabase: undefined
  // set undefined when navigating from another page
  selectedCollection: undefined
  // set undefined when navigating from another page
  selectedDocument: undefined

  stats?: ServerStats

  success?: string
  warning?: string
  error?: string
}

type DataDB = Omit<DataIndex, 'stats' | 'selectedDatabase'> & {
  collections: Mongo['collections'][string]

  selectedDatabase: string

  stats?: DBStats
}

type DataCollection = Omit<DataDB, 'stats' | 'selectedCollection'> & {
  selectedCollection: string

  docs: Record<string, any>[]
  columns: string[]
  count: number
  documentsPerPage: number
  stats?: CollectionStats
  indexes?: Index[]
}

type DataDocument = Omit<DataCollection, 'selectedDocument'> & {
  docString: string
  _id: any
  subtype: number | undefined

  selectedDocument: string
  readOnly: boolean
}

// (?) TODO Move to +data.once https://github.com/vikejs/vike/issues/1833
type DataLayout = DataIndex | DataDB | DataCollection | DataDocument
