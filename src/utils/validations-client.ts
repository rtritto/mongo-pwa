export const isValidCollectionName = (name: string) => {
  // if (name === undefined || name.length === 0) {
  //   return { error: true, message: 'You forgot to enter a collection name!' }
  // }

  // Collection names must begin with a letter, underscore, hyphen or slash, (tested v3.2.4)
  // and can contain only letters, underscores, hyphens, numbers, dots or slashes
  if (!/^[/A-Z_a-z-][\w./-]*$/.test(name)) {
    return {
      error: 'Collection names must begin with a letter, underscore, hyphen or'
        + ' slash, and can contain only letters,'
        + ' underscores, hyphens, numbers, dots or slashes'
    }
  }
  return {}
}

// https://docs.mongodb.com/manual/reference/limits/#naming-restrictions
export const isValidDatabaseNameRegex = (name: string) => {
  if (/[ "$*./:<>?|]/.test(name) === true) {
    return {
      error: 'Database must not contain /. "$*<>:|?'
    }
  }
  return {}
}

export const isValidDatabaseName = (name = '') => {
  if (name.length > 63) {
    const validation = isValidDatabaseNameRegex(name)
    return {
      error: 'error' in validation
        ? 'Database name must have fewer than 64 characters and must not contain /. "$*<>:|?'
        : 'Database name must have fewer than 64 characters'
    }
  }
  return isValidDatabaseNameRegex(name)
}
