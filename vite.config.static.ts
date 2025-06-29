import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Static build configuration for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/tictacpro/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});