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
    base: '/', // Default for development
  };

  // Only set GitHub Pages base path for production builds
  if (command === 'build') {
    config.base = '/threejs-visualizer-/';
  }

  return config;
});
