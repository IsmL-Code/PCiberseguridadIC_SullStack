import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiUrl = loadEnv(mode, '.', '').VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react(), tailwindcss()],
    // CSP para el build servido con `vite preview`; en produccion debe fijarla el servidor web
    preview: {
      headers: {
        'Content-Security-Policy':
          `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${apiUrl}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
      },
    },
  }
})
