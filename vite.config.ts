import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 3012,
    proxy: {
      '/ai-oversight': 'http://localhost:4000', // Change 5000 to your backend port if different
    },
    allowedHosts: [
      'bluehr.joinbluehr.com',
      'dev-bluehr.joinbluehr.com',
    ],
  },
  preview: {
    host: true,
    port: Number(process.env.VITE_PORT) || 3012,
  },
});
