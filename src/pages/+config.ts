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
  photon: {
    server: process.env.NODE_ENV === 'production'
      // (Preview deployment OR Docker) + Vercel
      // run build:node-entry and then run preview or run node dist/server/index.mjs
      ? (process.env.ENTRY_NODE === 'true'
        // Preview deployment OR Docker
        ? 'server/entry.node.ts'
        // Vercel
        : 'server/index.ts')
      // development
      : 'server/entry.node.ts',
    standalone: {
      bundle: true,
      minify: true,
      external: ['mongodb-query-parser']
    },
    target: process.env.ENTRY_NODE === 'true' ? 'node' : 'vercel'
  }
} satisfies Config
