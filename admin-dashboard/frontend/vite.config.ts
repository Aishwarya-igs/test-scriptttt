import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-server-only convenience, same pattern as dashboard/frontend/vite.config.ts:
// proxies API calls to the real backend so `npm run dev` here can hot-reload
// the UI without CORS/cookie issues. The built app is served directly by
// admin-dashboard/server.js in normal use.
const BACKEND = 'http://127.0.0.1:4400'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND,
    },
  },
})
