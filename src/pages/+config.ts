// import used to load the default config in globalThis
import '../../config.default'

import type { Config } from 'vike/types'
import vikePhoton from 'vike-photon/config'
import vikeSolid from 'vike-solid/config'

// Default config (can be overridden by pages)
export default {
  description: 'Mongo PWA GUI', // <meta name='description'>
  // prerender should be false because of localStorageAuth usage
  prerender: false,
  extends: [
    vikeSolid,
    vikePhoton
  ],
  // To run serve script, enable next line
  // server: 'server/entry.node.ts'
  photon: {
    server: process.env.NODE_ENV === 'production'
      ? (process.env.ENTRY_NODE === 'true'
        // Docker
        ? 'server/entry.node.ts'
        // Vercel
        : 'server/index.ts')
      // development
      : 'server/index.ts'
  }
} satisfies Config
