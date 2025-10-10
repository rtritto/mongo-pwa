type DataIndex = {
  title: string
  databases: Mongo['databases']
  options: Options
  stats?: ServerStats | DBStats | CollectionStats

  success?: string
  error?: string
}

type DataDB = DataIndex & {
  dbName: string
  collections: Mongo['collections'][string]

  selectedDatabase: string
}

type DataCollection = DataDB & {
  collectionName: string

  selectedCollection: string

  count: number
  docs: Record<string, any>[]
  items: Document[]
  columns: string[]
  pagination: number
  skip: number
  sort: number
}

type DataDocument = DataCollection & {
  documentName: string
  docString: string
  _id: any
  subtype: number | undefined

  selectedDocument: string
  readOnly: boolean
}
