// https://docs.mongodb.com/manual/reference/limits/#naming-restrictions
export default function isValidDatabaseNameRegex(name: string): ReturnValidation {
  if (/[ "$*./:<>?|]/.test(name) === true) {
    return {
      error: 'Database must not contain /. "$*<>:|?'
    }
  }
  return {}
}
