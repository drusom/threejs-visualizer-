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
      outDir: 'docs', // Build directly to docs folder
    },
    base: './', // Use relative paths for GitHub Pages
  };

  return config;
});
