import { type Context, Hono } from 'hono'

import api from './api'
import { ConfigDefault, IS_PRODUCTION } from '../../config.default'

const { authCookieKey, authCookiePassword } = ConfigDefault.options.auth

// Create a "sub-router" for the API
const apiRoutes = new Hono()

apiRoutes.post('/login', async (c: Context) => {
  if (!IS_PRODUCTION) return c.json({ success: true })
  const { password } = await c.req.json()
  if (password === authCookiePassword) {
    c.header('Set-Cookie', `${authCookieKey}=${authCookiePassword}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=34560000`) // 400 days
    return c.json({ success: true })
  }
  return c.json({ error: 'Unauthorized' }, 401)
})

// Route with dynamic parameter
apiRoutes.post('/:functionName', async (c: Context) => {
  if (
    IS_PRODUCTION
    && ConfigDefault.options.auth.enabled
    && c.req.raw.headers.get('cookie')?.includes(`${authCookieKey}=${authCookiePassword}`) !== true
  ) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  const functionName = c.req.param('functionName') as keyof typeof api
  if (!Object.hasOwn(api, functionName)) {
    return c.json({ error: 'Function not found' }, 400)
  }
  try {
    return await api[functionName](c)
  } catch (error) {
    console.error(error)
    return c.json({ error: (error as Error).message }, 500)
  }
})

export default apiRoutes
