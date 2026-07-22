export const getHeaders = (options: Config['options']) => ({
  'Content-Type': 'application/json',
  ...options.localStorageAuth.enabled && {
    [options.localStorageAuth.localStorageAuthKey!]: localStorage.getItem(options.localStorageAuth.localStorageAuthKey!)
  }
})
