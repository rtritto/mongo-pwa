import { createSignal } from 'solid-js'
import { reload } from 'vike-lite/client/router'

import { HEADERS } from '../getHeaders'

export function useManagerAuth(initialState: boolean) {
  const [isAuthorized, setIsAuthorized] = createSignal(initialState)

  const login = async (value: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ password: value })
      })

      if (res.ok) {
        setIsAuthorized(true)
        await reload()
      } else {
        alert('Invalid Password')
        setIsAuthorized(false)
      }
    } catch (error) {
      console.error('Login failed', error)
      setIsAuthorized(false)
    }
  }

  return {
    isAuthorized,
    login
  }
}
