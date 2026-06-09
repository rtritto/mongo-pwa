import { cors } from 'hono/cors'
import { Hono } from 'hono/quick'
// import { logger } from 'hono/logger'
import { renderPage } from 'vike/server'

import apiRoutes from './apiRoutes'

const app = new Hono()

// app.use(logger())

app.use(cors())

app.route('/api', apiRoutes)

// Catch-all remaining requests using Vike rendering
app.get('*', async (c, next) => {
  // Call Vike to render the page and get httpResponse from pageContext
  const { httpResponse } = await renderPage({
    urlOriginal: c.req.url,
    headersOriginal: c.req.raw.headers
  })

  // If Vike doesn't know what to do with the URL (e.g. no page exists for this route)
  if (!httpResponse) {
    return next()
  }

  // Vike provides a standard web stream for its response
  return new Response(httpResponse.getReadableWebStream(), {
    status: httpResponse.statusCode,
    headers: httpResponse.headers
  })
})

app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
