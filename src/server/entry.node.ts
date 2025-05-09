import { serve } from 'vike-server/hono/serve'

import app from './index'

const port = +(process.env.PORT || 3000)

serve(app, { port })
