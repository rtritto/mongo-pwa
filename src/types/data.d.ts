type DataIndex = {
  title: string
  databases: Mongo['databases']
  options: Options
  serverStats?: ServerStats

  success?: string
  error?: string
}

type DataDB = DataIndex & {
  dbName: string
  collections: Mongo['collections'][string]
  dbStats?: DBStats

  selectedDatabase: string
}

type DataCollection = DataDB & {
  collectionName: string
  collectionStats?: CollectionStats

  selectedCollection: string
}

type DataDocument = DataCollection & {
  documentName: string

  selectedDocument: string
}
