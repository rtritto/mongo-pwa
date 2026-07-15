import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vikeLite from 'vike-lite/vite'
import vikeLiteSolid from 'vike-lite-solid/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(async ({ mode }) => {
  // Add ME_CONFIG_ env vars to process.env
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'ME_CONFIG_'))

  return {
    root: 'src',
    cacheDir: '../.vite',
    plugins: [
      tailwindcss(),
      vikeLite({
        serverEntry: 'server/index'
      }),
      vikeLiteSolid(),
      ...process.env.NODE_ENV === 'production' ? [
        (await import('vite-plugin-pwa')).VitePWA({
          registerType: 'autoUpdate', // Automatically updates the service worker
          devOptions: {
            // enabled: true,  // Enable PWA in development mode
            type: 'module'
          },
          manifest: {
            name: 'Mongo Solid',
            short_name: 'MongoSolid',
            theme_color: '#3F51B5',
            background_color: '#3367D6',
            icons: [
              {
                src: '/icons/logo-192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        }).map((plugin) => ({
          ...plugin,
          // Prevent from generating registerSW.js inside /dist/server
          applyToEnvironment(environment: { name: string }) {
            return environment.name === 'client'
          }
        })),
        (await import('standaloner/vite')).default({
          bundle: true,
          minify: true
        })
      ] : []
    ],
    server: {
      port: 3000
    },
    build: {
      outDir: '../dist'
    },
    envPrefix: 'ME_CONFIG_',
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    }
  }
})
