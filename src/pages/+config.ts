import vikeSolid from 'vike-solid/config'
import type { Config } from 'vike/types'

// Default config (can be overridden by pages)
export default {
  description: 'Mongo PWA GUI', // <meta name='description'>
  prerender: true,
  extends: vikeSolid
} satisfies Config
