import type { Context } from 'hono'

import api from '../api'

export async function handlerApi(c: Context) {
  if (
    process.env.ME_CONFIG_LOCAL_STORAGE_AUTH_ENABLED === 'true'
    && c.req.header(process.env.ME_CONFIG_LOCAL_STORAGE_AUTH_KEY!) !== process.env.ME_CONFIG_LOCAL_STORAGE_AUTH_PASSWORD
  ) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  const functionName = c.req.param('functionName') as keyof typeof api
  if (!(functionName in api)) {
    return c.json({ error: 'Function not found' }, 400)
  }
  try {
    return await api[functionName](c)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
