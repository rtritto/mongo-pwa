import { serve } from '@photonjs/hono'

import app from './index'

const port = +(process.env.PORT || 3000)

export default serve(app, { port })
