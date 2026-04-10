import vike from '@vikejs/hono'
import { cors } from 'hono/cors'
import { Hono } from 'hono/quick'
// import { logger } from 'hono/logger'

import { handlerApi } from '@/server/handlers/handlerApi'

const app = new Hono()

app.use(cors())

// app.use(logger())

app.post('/api/:functionName', handlerApi)

vike(app)

export default app
