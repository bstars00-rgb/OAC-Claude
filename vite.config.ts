import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
// GitHub Pages serves the app from /OAC-Claude/. The GitHub Actions workflow
// sets GITHUB_PAGES=true so only that build uses the subpath base. Local dev and
// Vercel (which serve from the root) keep base '/'.
// (Test config lives in vitest.config.ts.)
const base = process.env.GITHUB_PAGES === 'true' ? '/OAC-Claude/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
