import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
// GitHub Pages serves the app from /OAC-Claude/. The GitHub Actions workflow
// sets GITHUB_PAGES=true so only that build uses the subpath base. Local dev and
// Vercel (which serve from the root) keep base '/'.
// (Test config lives in vitest.config.ts.)
const base = process.env.GITHUB_PAGES === 'true' ? '/OAC-Claude/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // B-1: installable PWA + offline app-shell. autoUpdate atomically swaps the
    // service worker on each deploy and prunes old caches, so hashed chunks never
    // go stale. SW only ships in the production build (devOptions off → dev & E2E
    // run without it).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'OAC — Ohmyhotel AI CRM',
        short_name: 'OAC',
        description: 'Context-based AI sales & relationship CRM',
        theme_color: '#1f48f0',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
