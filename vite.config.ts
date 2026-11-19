/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { defineConfig, type Plugin } from 'vite';

// Build stamp YYYY.MM.DD.HH.MM (local time), new on every build/deploy.
const d = new Date();
const two = (n: number) => String(n).padStart(2, '0');
const BUILD_STAMP = `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())}.${two(d.getHours())}.${two(d.getMinutes())}`;

/** Writes version.json beside the app so running copies can detect a newer deploy. */
const versionFile = (): Plugin => ({
  name: 'wbs-version-file',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: BUILD_STAMP }) + '\n' });
  },
});

export default defineConfig({
  base: './',
  define: { __BUILD_STAMP__: JSON.stringify(BUILD_STAMP) },
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
