import { serve } from '@photonjs/hono'

import app from './index'

const port = +(process.env.PORT || 3000)

serve(app, { port })
