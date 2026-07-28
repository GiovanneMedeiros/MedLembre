import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Permite acessar o servidor de dev via túnel público (ex: cloudflared)
    // para testar em celular durante o desenvolvimento.
    allowedHosts: ['.trycloudflare.com'],
  },
})
