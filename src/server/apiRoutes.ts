import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import api from './api'
import { ConfigDefault, IS_PRODUCTION } from '../../config.default'

const { authCookieKey, authCookiePassword } = ConfigDefault.options.auth

const apiRoutes = new Hono()

apiRoutes.post('/login', async (c: Context) => {
  if (!IS_PRODUCTION) return c.json({ success: true })
  const { password } = await c.req.json<{ password: string }>()
  if (password === authCookiePassword) {
    c.header('Set-Cookie', `${authCookieKey}=${authCookiePassword}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=34560000`) // 400 days
    return c.json({ success: true })
  }
  return c.json({ error: 'Unauthorized' }, 401)
})

apiRoutes.post('/:functionName', async (c: Context) => {
  if (
    IS_PRODUCTION
    && ConfigDefault.options.auth.enabled
    && !c.req.raw.headers.get('cookie')?.includes(`${authCookieKey}=${authCookiePassword}`)
  ) return c.json({ error: 'Not authenticated' }, 401)
  const functionName = c.req.param('functionName') as keyof typeof api
  if (!Object.hasOwn(api, functionName)) return c.json({ error: 'Function not found' }, 400)
  try {
    let payload = null
    const contentType = c.req.header('content-type')
    if (contentType) {
      if (contentType.includes('application/json')) payload = await c.req.json()
      else if (contentType.includes('multipart/form-data')) payload = await c.req.parseBody()
      else return c.json({ error: 'Unsupported Content-Type' }, 400)
    }
    const result = await api[functionName](payload)
    if (result instanceof Response) return result
    return c.json(result)
  } catch (error) {
    console.error(error)
    if (error instanceof HTTPException) return c.json({ error: error.name, message: error.message }, error.status)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default apiRoutes
