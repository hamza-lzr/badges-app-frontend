import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
/* server: {
    host: true,              // allow access from external networks
    port: 5173,
    allowedHosts: true       // ✅ allow all hosts (ngrok, loca.lt, etc.)
  }
    */
})
