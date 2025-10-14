// import used to load the default config in globalThis
import '../../config.default'

import type { Config } from 'vike/types'
import vikeServer from 'vike-server/config'
import vikeSolid from 'vike-solid/config'

// Default config (can be overridden by pages)
export default {
  description: 'Mongo PWA GUI', // <meta name='description'>
  prerender: {
    partial: true
  },
  extends: [
    vikeSolid,
    vikeServer
  ],
  server: process.env.NODE_ENV === 'production' ? 'server/index.ts' : 'server/entry.node.ts'
} satisfies Config
