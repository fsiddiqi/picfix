import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    https: {
      cert: fs.readFileSync('192.168.68.51+2.pem'),
      key: fs.readFileSync('192.168.68.51+2-key.pem'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*$/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'PicFix',
        short_name: 'PicFix',
        description: 'Digitize physical photos into digital albums',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        categories: ['photography', 'utilities'],
        icons: [
          { src: 'pwa-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: 'pwa-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'pwa-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'pwa-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: 'pwa-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'pwa-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: 'screenshot-capture.png',
            sizes: '540x960',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Capture screen',
          },
        ],
      },
    }),
  ],
});
