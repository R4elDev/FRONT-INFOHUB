import * as path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1/infohub'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log(' Erro no proxy:', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log(' Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(' Proxy Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})