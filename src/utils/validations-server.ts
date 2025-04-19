import toBSON from 'mongodb-query-parser'

export const checkDatabase = (dbName: string) => {
  if (!(dbName in globalThis.mongo.connections)) {
    throw new Error(`Database "${dbName}" not found!`)
  }
}

export const checkCollection = (dbName: string, collectionName: string) => {
  if (!globalThis.mongo.collections[dbName].includes(collectionName)) {
    throw new Error(`Collection "${collectionName}" not found!`)
  }
}

export const checkDocument = (document: string) => {
  try {
    return toBSON(document)
  } catch {
    throw new Error('That document in request body is not valid!')
  }
}

export const checkOption = (option: keyof typeof globalThis.config.options, value: unknown) => {
  if (globalThis.config.options[option] === value) {
    throw new Error(`Error: config.options.${option} is set to ${value}`)
  }
}
