type DataIndex = {
  title: string
  databases: Mongo['databases']
  options: import('../../config.default.ts').Config['options']
  serverStats?: ServerStats

  success?: string
  error?: string
}

type DataDB = DataIndex & {
  dbName: string
  collections: Mongo['collections'][string]
  dbStats?: ReturnType<typeof import('../utils/mappers/mapInfo.ts')['mapDatabaseStats']>

  selectedDatabase: string
}

type DataCollection = DataDB & {
  collectionName: string
  collectionStats?: ReturnType<typeof import('../utils/mappers/mapInfo.ts')['mapCollectionStats']>

  selectedCollection: string
}

type DataDocument = DataCollection & {
  documentName: string

  selectedDocument: string
}
