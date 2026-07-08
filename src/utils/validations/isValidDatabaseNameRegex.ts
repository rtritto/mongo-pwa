// https://docs.mongodb.com/manual/reference/limits/#naming-restrictions
export default function isValidDatabaseNameRegex(name: string): ReturnValidation {
  if (/[ "$*./:<>?|]/.test(name)) {
    return {
      error: 'Database must not contain /. "$*<>:|?'
    }
  }
  return {}
}
