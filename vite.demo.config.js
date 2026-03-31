import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: 'example',
  plugins: [react()],
  resolve: {
    alias: {
      'react-column-drag-resize-table': resolve(__dirname, 'src/index.js')
    }
  },
  server: {
    port: 5173
  }
});
