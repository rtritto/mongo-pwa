import type { Config } from 'vike/types'
import vikeSolid from 'vike-solid/config'

// Default config (can be overridden by pages)
export default {
  prerender: {
    partial: true
  },
  // title: 'Mongo PWA', // <title>
  // description: 'Demo showcasing Vike + Solid', // <meta name='description'>
  // bodyAttributes: {
  //   class: 'dark'
  // },
  extends: [
    vikeSolid
  ]
} satisfies Config
