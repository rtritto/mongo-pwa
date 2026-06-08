#!/usr/bin/env node
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono/quick'

import vikeApp from '../dist/server/index.mjs'

const app = new Hono()

if (process.env.ENTRY_NODE === 'true') {
  app.use(await import('hono/compress').compress())
}

app.use('*', serveStatic({ root: './dist/client' }))

app.route('/', vikeApp)

const { PORT } = process.env
const port = PORT ? Number.parseInt(PORT) : 3000

serve({
  fetch: app.fetch,
  port
}, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`)
})
