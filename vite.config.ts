/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    target: 'es2022',
    rollupOptions: {
      output: {
        postBanner: '/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */'
      }
    }
  },
  server: {
    port: 3000
  }
});
