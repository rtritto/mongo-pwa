import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vike from 'vike/plugin'
import vikeSolid from 'vike-solid/vite'
import { defineConfig, loadEnv, type UserConfig } from 'vite'

const minify = true

export default defineConfig(async ({ mode }) => {
  // Add ME_CONFIG_ env vars to process.env
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'ME_CONFIG_'))

  return {
    root: 'src',
    cacheDir: '../.vite',
    plugins: [
      tailwindcss(),
      vike(),
      vikeSolid(),
      ...process.env.NODE_ENV === 'production' ? [
        (await import('vite-plugin-pwa')).VitePWA({
          registerType: 'autoUpdate', // Automatically updates the service worker
          devOptions: {
            // enabled: true,  // Enable PWA in development mode ~ Disable https://github.com/vikejs/vike/issues/388#issuecomment-1199280084
            type: 'module'
          },
          manifest: {
            name: 'Mongo PWA',
            short_name: 'MongoPWA',
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
          minify
        })
      ] : []
    ],
    server: {
      cors: false
    },
    build: {
      target: 'esnext',
      outDir: '../dist',
      emptyOutDir: true,
      minify
    },
    envPrefix: 'ME_CONFIG_',
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src')
      }
    }
  } satisfies UserConfig
})
