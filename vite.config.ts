import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vike from 'vike/plugin'
import { vikeNode } from 'vike-node/plugin'
import vikeSolid from 'vike-solid/vite'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
// TODO Enable PWA
// import { VitePWA } from 'vite-plugin-pwa'

import getConfigDefault from './config.default'
import getMongo from './src/server/db'

export default defineConfig(async ({ mode }) => {
  // Add ME_CONFIG_ env vars to process.env
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'ME_CONFIG_'))

  global.config = getConfigDefault()
  global.mongo = getMongo()
  await global.mongo.connect(global.config)

  return {
    root: 'src',
    cacheDir: '../.vite',
    plugins: [
      tailwindcss(),
      vike(),
      vikeSolid(),
      vikeNode('server/index.ts'),
      // Enable to start the server with `yarn prod` command
      // vikeNode('server/entry.node.ts'),
      // vikeNode(process.env.NODE_ENV === 'production' ? 'server/index.ts' : 'server/entry.node.ts'),
      // TODO this throws an error in vike-node into vike-node:edge:build
      // Maybe it's used only with Edge Runtime in Vercel
      // vikeNode({
      //   entry: {
      //     index: 'server/entry.node.ts',
      //     app: {
      //       entry: 'server/app.ts',
      //       runtime: 'vercel'
      //     }
      //   }
      // }),
      // VitePWA({
      //   registerType: 'autoUpdate', // Automatically updates the service worker
      //   devOptions: {
      //     // enabled: true,  // Enable PWA in development mode ~ Disable https://github.com/vikejs/vike/issues/388#issuecomment-1199280084
      //     type: 'module'
      //   },
      //   manifest: {
      //     name: 'Mongo PWA',
      //     short_name: 'MongoPWA',
      //     theme_color: '#3F51B5',
      //     background_color: '#3367D6',
      //     icons: [
      //       {
      //         src: '/icons/logo-192.png',
      //         sizes: '192x192',
      //         type: 'image/png'
      //       }
      //     ]
      //   }
      // })
    ],
    server: {
      // host: '127.0.0.1',
      // port: 3000,
      cors: false
    },
    build: {
      target: 'esnext',
      outDir: '../dist',
      minify: true
    },
    envPrefix: 'ME_CONFIG_',
    esbuild: {
      legalComments: 'none'
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    }
  } satisfies UserConfig
})
