import { bytesToSize, convertBytes } from './mapUtils'

const EMPTY_COLLECTION_SIZE = 4096

// TODO add global lock time stats and replica set stats
export const mapServerStats = (serverStatus: ServerStatus) => ({
  dbHost: {
    label: 'Hostname',
    value: serverStatus.host
  },
  dbVersion: {
    label: 'MongoDB Version',
    value: serverStatus.version
  },
  uptime: {
    label: 'Uptime',
    value: `${serverStatus.uptime} seconds ${serverStatus.uptime > 86400
      ? `(${Math.floor(serverStatus.uptime / 86400)} days)`
      : ''}`
  },
  nodeVersion: {
    label: 'Node Version',
    value: process.versions.node
  },
  serverTime: {
    label: 'Server Time',
    value: serverStatus.localTime.toUTCString()
  },
  v8Version: {
    label: 'V8 Version',
    value: process.versions.v8
  },
  currentConnections: {
    label: 'Current Connections',
    value: serverStatus.connections.current
  },
  availableConnections: {
    label: 'Available Connections',
    value: serverStatus.connections.available
  },
  ...'globalLock' in serverStatus && {
    ...'activeClients' in serverStatus.globalLock && {
      activeClients: {
        label: 'Active Clients',
        value: serverStatus.globalLock.activeClients.total
      },
      clientsReading: {
        label: 'Clients Reading',
        value: serverStatus.globalLock.activeClients.readers
      },
      clientsWriting: {
        label: 'Clients Writing',
        value: serverStatus.globalLock.activeClients.writers
      }
    },
    ...'currentQueue' in serverStatus.globalLock && {
      queuedOperations: {
        label: 'Queued Operations',
        value: serverStatus.globalLock.currentQueue.total
      },
      readLockQueue: {
        label: 'Read Lock Queue',
        value: serverStatus.globalLock.currentQueue.readers
      },
      writeLockQueue: {
        label: 'Write Lock Queue',
        value: serverStatus.globalLock.currentQueue.writers
      }
    }
  },
  /* (?) deprecated */ ...'backgroundFlushing' in serverStatus && {
    diskFlushes: {
      label: 'Disk Flushes',
      value: serverStatus.backgroundFlushing.flushes
    },
    ...'last_finished' in serverStatus.backgroundFlushing && {
      lastFlush: {
        label: 'Last Flush',
        value: serverStatus.backgroundFlushing.last_finished.toDateString()
      }
    },
    ...'total_ms' in serverStatus.backgroundFlushing && {
      timeSpentFlushing: {
        label: 'Time Spent Flushing',
        value: `${serverStatus.backgroundFlushing.total_ms} ms`
      }
    },
    ...'average_ms' in serverStatus.backgroundFlushing && {
      averageFlushTime: {
        label: 'Average Flush Time',
        value: `${serverStatus.backgroundFlushing.average_ms} ms`
      }
    }
  },
  totalInserts: {
    label: 'Total Inserts',
    value: serverStatus.opcounters.insert
  },
  totalQueries: {
    label: 'Total Queries',
    value: serverStatus.opcounters.query
  },
  totalUpdates: {
    label: 'Total Updates',
    value: serverStatus.opcounters.update
  },
  totalDeletes: {
    label: 'Total Deletes',
    value: serverStatus.opcounters.delete
  }
})

export const mapDatabaseStats = (dbStats: DbStats) => ({
  avgObjSize: {
    label: 'Average Document Size',
    value: bytesToSize(dbStats.avgObjSize || 0)
  },
  collections: {
    label: 'Total Collections (incl. system.namespaces)',
    value: dbStats.collections
  },
  /* (?) deprecated */ ...'dataFileVersion' in dbStats && {
    dataFileVersion: {
      label: 'Data File Version',
      value: `${dbStats.dataFileVersion.major}.${dbStats.dataFileVersion.minor}`
    }
  },
  dataSize: {
    label: 'Data Size',
    value: bytesToSize(dbStats.dataSize)
  },
  /* (?) deprecated */ ...'extentFreeList' in dbStats && {
    extentFreeListNum: {
      label: 'Extents Free List',
      value: dbStats.extentFreeList.num
    }
  },
  /* (?) deprecated */ ...'fileSize' in dbStats && {
    fileSize: {
      label: 'File Size',
      value: bytesToSize(dbStats.fileSize)
    }
  },
  indexes: {
    label: 'Total Indexes',
    value: dbStats.indexes
  },
  indexSize: {
    label: 'Index Size',
    original: dbStats.indexSize,
    value: bytesToSize(dbStats.indexSize)
  },
  /* (?) deprecated */ ...'numExtents' in dbStats && {
    numExtents: {
      label: 'Total Extents',
      value: dbStats.numExtents.toString()
    }
  },
  objects: {
    label: 'Total Documents',
    value: dbStats.objects
  },
  storageSize: {
    label: 'Storage Size',
    original: dbStats.storageSize,
    value: bytesToSize(dbStats.storageSize)
  }
})

export const mapAddCollection = (databaseStats) => {
  const newIndexSize = databaseStats.indexSize.original + EMPTY_COLLECTION_SIZE
  const newStorageSize = databaseStats.storageSize.original + EMPTY_COLLECTION_SIZE
  return {
    ...databaseStats,
    collections: {
      ...databaseStats.collections,
      value: databaseStats.collections.value + 1
    },
    indexes: {
      ...databaseStats.indexes,
      value: databaseStats.indexes.value + 1
    },
    indexSize: {
      ...databaseStats.indexSize,
      original: newIndexSize,
      value: bytesToSize(newIndexSize)
    },
    storageSize: {
      ...databaseStats.storageSize,
      original: newStorageSize,
      value: bytesToSize(newStorageSize)
    }
  }
}

export const mapCollectionStats = (collStats: CollStats) => ({
  count: {
    label: 'Documents',
    value: collStats.count
  },
  size: {
    label: 'Total doc size',
    value: convertBytes(collStats.size)
  },
  avgObjSize: {
    label: 'Average doc size',
    value: convertBytes(collStats.avgObjSize)
  },
  storageSize: {
    label: 'Pre-allocated size',
    value: convertBytes(collStats.storageSize)
  },
  nindexes: {
    label: 'Indexes',
    value: collStats.nindexes
  },
  totalIndexSize: {
    label: 'Total index size',
    value: convertBytes(collStats.totalIndexSize)
  },
  /* (?) deprecated */ ...'paddingFactor' in collStats && {
    paddingFactor: {
      label: 'Padding factor',
      value: collStats.paddingFactor
    }
  },
  /* (?) deprecated */ ...'numExtents' in collStats && {
    numExtents: {
      label: 'Extents',
      value: collStats.numExtents
    }
  }
})
