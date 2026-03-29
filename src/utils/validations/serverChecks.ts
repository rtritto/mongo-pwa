export const checkDatabase = (dbName: string) => {
  if (!(dbName in globalThis.mongo.connections)) {
    return {
      error: `Database "${dbName}" not found!`
    }
  }
  return {}
}

export const checkDatabaseCollection = (dbName: string, collectionName: string) => {
  if (!(dbName in globalThis.mongo.connections)) {
    return {
      error: `Database "${dbName}" not found!`
    }
  }
  if (!globalThis.mongo.collections[dbName].includes(collectionName)) {
    return {
      error: `Collection "${collectionName}" not found!`
    }
  }
  return {}
}

export const checkOptions = (optionsToCheck: Partial<typeof globalThis.config.options>) => {
  for (const option in optionsToCheck) {
    const value = optionsToCheck[option as keyof typeof globalThis.config.options]
    if (globalThis.config.options[option as keyof typeof globalThis.config.options] !== value) {
      return {
        error: `Option "config.options.${option}" it's different from ${value}`
      }
    }
  }
  return {}
}
