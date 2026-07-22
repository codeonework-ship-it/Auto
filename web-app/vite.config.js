import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the AutoHub public web app.
// Dev server runs on 5173 and proxies /api to the Spring Boot backend on 8080.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
  },
});
