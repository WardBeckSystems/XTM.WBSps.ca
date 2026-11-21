/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const APP_VERSION = pkg.version || '1.0.0';

/** Writes version.json beside the app so running copies can detect a newer deploy. */
const versionFile = (): Plugin => ({
  name: 'wbs-version-file',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({
        version: APP_VERSION,
        buildTime: new Date().toISOString()
      }, null, 2) + '\n'
    });
  },
});

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __BUILD_STAMP__: JSON.stringify(APP_VERSION)
  },
  plugins: [versionFile()],
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
