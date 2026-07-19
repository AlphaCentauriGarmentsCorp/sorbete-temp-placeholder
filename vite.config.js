import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Query-param routing (?page=…) means a single entry point; no SPA fallback config needed.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
})
