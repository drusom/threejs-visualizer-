import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      outDir: 'dist',
    },
    base: '/', // Default base path for local development
  };

  // Only set base path for production builds (GitHub Pages)
  // During local development, keep base as '/' so assets load correctly
  if (command === 'build') {
    config.base = '/threejs-visualizer-/';
  }

  return config;
});
