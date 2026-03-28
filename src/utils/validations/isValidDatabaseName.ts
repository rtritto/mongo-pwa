import isValidDatabaseNameRegex from './isValidDatabaseNameRegex'

export default function isValidDatabaseName(name = ''): ReturnValidation {
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
