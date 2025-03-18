import type { Context } from 'hono'

import api from '../api'

export async function handlerApi(c: Context) {
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
