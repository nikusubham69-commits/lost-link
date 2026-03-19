import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['GIET.jpeg', 'GIET!.jpg'],
      manifest: {
        name: 'Lost-Link ',
        short_name: 'LostLink',
        description: 'Futuristic Campus Lost and Found Portal',
        theme_color: '#003366',
        background_color: '#000000',
        icons: [
          {
            src: 'GIET.jpeg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'GIET!.jpeg',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})