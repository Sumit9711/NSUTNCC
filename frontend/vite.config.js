import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/auth': 'http://127.0.0.1:5000',
      '/static': 'http://127.0.0.1:5000',
      '/attendance': {
        target: 'http://127.0.0.1:5000',
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return req.url
          }
        }
      },
      '/admin': {
        target: 'http://127.0.0.1:5000',
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return req.url
          }
        }
      },
    },
  },
})
