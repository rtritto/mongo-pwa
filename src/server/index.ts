import { cors } from 'hono/cors'
import { Hono } from 'hono/quick'
// import { logger } from 'hono/logger'
import { renderPage } from 'vike-lite/server'

import apiRoutes from './apiRoutes'

const app = new Hono()

// app.use(logger())

if (process.env.NODE_ENV === 'production') {
  app.use(cors())
}

app.route('/api', apiRoutes)

// Catch-all remaining requests using Vike rendering
app.get('*', async (c) => {
  return await renderPage(c.req.raw)
})

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
