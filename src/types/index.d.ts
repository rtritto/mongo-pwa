type ParsedUrlQuery = import('querystring').ParsedUrlQuery

type Admin = import('mongodb').Admin
/**
 * @public
 * @see https://docs.mongodb.org/manual/reference/command/collStats
 */
type CollStats = import('mongodb').CollStats
type Db = import('mongodb').Db
type MongoDocument = import('mongodb').Document
type MongoClient = import('mongodb').MongoClient

type NextApiRequest = import('next').NextApiRequest
type NextApiResponse = import('next').NextApiResponse
type NextApiHandler = import('next').NextApiHandler
type Redirect = import('next').Redirect

type Config = import('./../config.default.mts').Config
type MongoDb = import('./../config.default.mts').MongoDb
type ServerStats = ReturnType<typeof import('../utils/mappers/mapInfo.ts')['mapServerStats']>
type DBStats = ReturnType<typeof import('../utils/mappers/mapInfo.ts')['mapDatabaseStats']>
type CollectionStats = ReturnType<typeof import('../utils/mappers/mapInfo.ts')['mapCollectionStats']>
type Options = import('../../config.default.ts').Config['options']

type PrimitiveTypes = boolean | string | number

type CustomApiError = (unknown | Error) & {
  message: string
  status: number
}

/**
 * Type definition is missing in mongodb
 * @see https://www.mongodb.com/docs/manual/reference/command/serverStatus
 */
interface ServerStatus extends MongoDocument {
  host: string
  version: string
  uptime: number
  localTime: Date
  connections: {
    current: number
    available: number
  }
  globalLock: {
    activeClients: {
      readers: number
      total: number
      writers: number
    }
    currentQueue: {
      readers: number
      total: number
      writers: number
    }
  }
  opcounters: {
    insert: number
    query: number
    update: number
    delete: number
  }
  // missing in doc, are they deprecated?
  backgroundFlushing: {
    flushes: number
    last_finished: Date
    total_ms: number
    average_ms: number
  }
}

/**
 * Type definition is missing in mongodb
 * @see https://www.mongodb.com/docs/manual/reference/command/dbStats
 */
interface DbStats extends MongoDocument {
  db: string
  collections: number
  view: number
  objects: number
  avgObjSize: number // float
  dataSize: number
  storageSize: number
  freeStorageSize: number
  indexes: number
  indexSize: number
  indexFreeStorageSize: number
  totalSize: number
  totalFreeStorageSize: number
  scaleFactor: number
  fsUsedSize: number
  fsTotalSize: number
  ok: number
  // missing in doc, are they deprecated?
  fileSize: number
  dataFileVersion: {
    major: number
    minor: number
  }
  extentFreeList: {
    num: number
  }
  numExtents: number
}

interface Index extends MongoDocument {
  v: number
  key: {
    [name: string]: number
  }
  name: string
  size: number
}

type Indexes = Index[]

// type of connections<connectionInfo> or clients<{info}>
type ClientInfo = {
  connectionName: string
  client: MongoClient
  adminDb: Admin | null
  info: MongoDb
}

type Collections = {
  [dbName: string]: string[]
}

type Connection = {
  info: ClientInfo
  dbName: string
  fullName: string
  db: Db
}

type Connections = {
  [key: string]: Connection
}

// type Mongo = import('middlewares/db.mts').Mongo
type Mongo = {
  mongoClient: MongoClient
  clients: ClientInfo[]
  connections: Connections
  databases: string[]
  collections: Collections
  // gridFSBuckets?  TODO
  mainClient: ClientInfo | null
  adminDb: ClientInfo['adminDb'] | null
  addConnection: (info: ClientInfo, db: Db, dbName: string) => Connection
  getDatabases: () => string[]
  updateCollections: (dbConnection: Connection) => Promise<void>
  updateDatabases: () => Promise<void>
}

interface Params extends ParsedUrlQuery {
  collectionName: string
  dbName: string
  documentId: string
}

interface QueryParameter extends ParsedUrlQuery {
  // mongodb
  sort?: string
  projection?: string
  // custom
  page?: string
  key?: string
  value?: string
  type?: string
  query?: string
  subtype?: string
  runAggregate?: 'on' | 'off'
}
