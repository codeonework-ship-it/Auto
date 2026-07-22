import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AutoHub control-panel dev server on 5174, proxying API calls to the Spring Boot backend on 8080.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
