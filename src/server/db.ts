import { type Db, MongoClient } from 'mongodb'

import getConfigDefault, { type MongoDb } from '../../config.default'

/**
* Global is used here to maintain a cached connection across hot reloads
* in development. This prevents connections growing exponentially
* during API Route usage.
*/

// update the collections list
function getDatabases() {
  return Object.keys(globalThis.mongo.connections).toSorted()
}

async function updateCollections(dbConnection: Connection) {
  if (!dbConnection.fullName) {
    console.error('Received db instead of db connection')
    return /* [] */
  }
  const collections = await dbConnection.db.listCollections().toArray()
  const names = []
  for (const { name } of collections) {
    names.push(name)
  }
  globalThis.mongo.collections[dbConnection.fullName] = names.toSorted()
  // return collections
}

// update database list
function addConnection(info: ClientInfo, db: Db, dbName: string): Connection {
  const fullName = globalThis.mongo.clients.length > 1
    ? `${info.connectionName}_${dbName}`
    : dbName
  const connection = {
    info,
    dbName,
    fullName,
    db
  }
  globalThis.mongo.connections[fullName] = connection
  return connection
}

async function updateDatabases() {
  globalThis.mongo.connections = {}
  globalThis.mongo.collections = {}
  await Promise.all(
    globalThis.mongo.clients.map(async (clientInfo: ClientInfo) => {
      if (clientInfo.adminDb) {
        const allDbs = await clientInfo.adminDb.listDatabases()
        for (const database of allDbs.databases) {
          const dbName = database.name
          if (dbName) {
            if (clientInfo.info.whitelist.length > 0 && !clientInfo.info.whitelist.includes(dbName)) {
              continue
            }

            if (clientInfo.info.blacklist.length > 0 && clientInfo.info.blacklist.includes(dbName)) {
              continue
            }
            const connection = addConnection(clientInfo, clientInfo.client.db(dbName), dbName)

            await updateCollections(connection)
          }
        }
      } else {
        const dbConnection = clientInfo.client.db()
        const dbName = dbConnection.databaseName
        const connection = addConnection(clientInfo, dbConnection, dbName)
        await updateCollections(connection)
      }
      globalThis.mongo.databases = getDatabases()
    })
  )
}

export async function connectClient() {
  if (globalThis.mongo) {
    await updateDatabases()
    await Promise.all(
      Object.values(globalThis.mongo.connections).map((connection) => updateCollections(connection))
    )
    return
    // return globalThis.mongo.mongoClient
  }
  globalThis.config = getConfigDefault()

  // database connections
  const connections = Array.isArray(globalThis.config.mongodb) ? globalThis.config.mongodb : [globalThis.config.mongodb]
  const clients = await Promise.all(connections.map(async (connectionInfo: MongoDb, index: number) => {
    const { connectionString, connectionName, admin, connectionOptions } = connectionInfo
    try {
      const client = await MongoClient.connect(connectionString, connectionOptions)
      const adminDb = admin ? client.db().admin() : null
      return {
        adminDb,
        client,
        connectionName: connectionName || `connection${index}`,
        info: connectionInfo
      }
    } catch (error) {
      console.error(`Could not connect to database using connectionString: ${connectionString.replace(/(mongo.*?:\/\/.*?:).*?@/, '$1****@')}"`)
      throw error
    }
  }))
  const [client] = clients
  globalThis.mongo = {
    clients,
    mainClient: client,
    adminDb: client.adminDb,
    mongoClient: client.client
  } as Mongo
  await updateDatabases()

  // return globalThis.mongo.mongoClient
}
