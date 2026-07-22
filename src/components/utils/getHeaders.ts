export const getHeaders = (options: Config['options'], contentType = true) => {
  const headers: Record<string, string> = {}
  if (contentType) headers['Content-Type'] = 'application/json'
  if (options.localStorageAuth.enabled) {
    const localStorageAuthValue = localStorage.getItem(options.localStorageAuth.localStorageAuthKey!)
    if (localStorageAuthValue)
      headers[options.localStorageAuth.localStorageAuthKey!] = localStorageAuthValue
  }
  return headers
}
