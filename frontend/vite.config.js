import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      // Proxy to your live SAP NetWeaver Gateway server
      '/sap': {
        target: 'https://merida.cob.csuchico.edu:8038',
        changeOrigin: true,
        secure: false,
      },
      // Proxy to Node.js BFF Backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});

