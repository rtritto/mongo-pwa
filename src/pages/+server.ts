import type { Server } from 'vike/types'

import app from './+server.index'

export default {
  fetch: app.fetch
} satisfies Server
