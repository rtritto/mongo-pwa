import { cors } from 'hono/cors'
import { Hono } from 'hono/quick'
// (?) TODO logger can help
// import { logger } from 'hono/logger'
import { renderPage } from 'vike-lite/server'

import apiRoutes from './apiRoutes'

const app = new Hono()

// app.use(logger())

if (process.env.NODE_ENV === 'production') app.use(cors())

app.route('/api', apiRoutes)

// Catch-all remaining requests using custom rendering
app.get('*', async (c) => {
  return await renderPage(c.req.raw, { headers: c.req.raw.headers })
})

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
