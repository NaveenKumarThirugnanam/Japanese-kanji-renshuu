import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'N2 漢字 Anki',
        short_name: '漢字 Anki',
        description: 'JLPT N2 Kanji flashcard study app — Shin Kanzen Master',
        theme_color: '#0e0c0a',
        background_color: '#f8f3ea',
        display: 'standalone',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,ico}'],
        runtimeCaching: [
          {
            // Cache all kanji data (ranges, search, stroke) — data never changes after load
            urlPattern: ({ url }) => url.pathname.startsWith('/api/kanji'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'kanji-api-v1',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Sessions — prefer fresh data but fall back to cache if offline
            urlPattern: ({ url }) => url.pathname.startsWith('/api/sessions'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sessions-api-v1',
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5183,
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
    },
  },
})
