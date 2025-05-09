import { Hono } from 'hono'
import { cors } from 'hono/cors'
// import { logger } from 'hono/logger'
import { apply } from 'vike-server/hono'

import { handlerApi } from './handlers/handlerApi'

const app = new Hono()

app.use(cors())

// app.use(logger())

app.post('/api/:functionName', handlerApi)

apply(app)

export default app
