import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-server-only convenience: proxies API/WS calls to the real backend so
// `npm run dashboard:dev` can hot-reload the UI. `npm run dashboard` (the
// normal path) always serves the built dist/ via the Express backend
// directly, so end users never need two servers running.
const BACKEND = 'http://127.0.0.1:4300'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND,
      '/ws': { target: BACKEND, ws: true },
    },
  },
})
