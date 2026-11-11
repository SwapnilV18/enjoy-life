import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'media/*.jpg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,webp,mp4}'],
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Enjoy Life',
        short_name: 'Enjoy Life',
        description: 'Enjoy Life',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e1116',
        theme_color: '#0e1116',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'] },
});
