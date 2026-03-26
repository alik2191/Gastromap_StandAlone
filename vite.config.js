import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-icon-192.png', 'pwa-icon-512.png'],
      manifest: {
        name: 'GastroMap — Smart AI Dining Guide',
        short_name: 'GastroMap',
        description: 'Discover the best restaurants with AI. Your personal gastronomic expert.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['food', 'lifestyle', 'travel'],
        icons: [
          {
            src: 'pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/i\.pravatar\.cc\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatar-images-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - always needed
          'react-core': ['react', 'react-dom'],
          // Router
          'react-router': ['react-router-dom'],
          // Heavy animation library
          'framer-motion': ['framer-motion'],
          // Icons (large library)
          'lucide': ['lucide-react'],
          // Map libraries (only loaded on explore/map pages)
          'leaflet': ['leaflet', 'react-leaflet'],
          // i18n
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // TanStack utilities
          'tanstack': ['@tanstack/react-query', '@tanstack/react-virtual'],
          // Admin (never needed on public routes)
          'admin': [
            '/src/features/admin/layout/AdminLayout.jsx',
            '/src/features/admin/pages/AdminDashboardPage.jsx',
          ],
        }
      }
    },
    // Raise the chunk warning threshold
    chunkSizeWarningLimit: 600,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
