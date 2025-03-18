import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
// import { logger } from 'hono/logger'
import vike from 'vike-node/hono'

import { handlerApi } from './handlers/handlerApi'

const app = new Hono()

app.use(cors())

// app.use(logger())

app.post('/api/:functionName', handlerApi)

app.use(vike())

const port = +(process.env.PORT || 3000)

serve({
  fetch: app.fetch,
  port
}, () => console.log(`Server running at http://localhost:${port}`))
