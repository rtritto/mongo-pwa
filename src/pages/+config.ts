import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'

// Default config (can be overridden by pages)
export default {
  prerender: {
    partial: true
  },
  // title: 'Kai Anime', // <title>
  // description: 'Demo showcasing Vike + Solid', // <meta name='description'>
  // bodyAttributes: {
  //   class: 'dark'
  // },
  extends: [
    vikeSolid
  ],
  server: process.env.NODE_ENV === 'production'
    // (Preview deployment OR Docker) + Vercel
    // run build:node-entry and then run preview or run node dist/server/index.mjs
    ? (process.env.ENTRY_NODE === 'true'
      // Preview deployment OR Docker
      ? 'import:./+server.ts:default'
      // Vercel
      : 'import:./+server.index.ts:default')
    // development
    : 'import:./+server.ts:default'
} satisfies Config
