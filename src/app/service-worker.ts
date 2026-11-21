/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Service worker registration (cache-first offline app); skipped in the Vite dev server. */
import { notifyUpdateAvailable } from './update-check';

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && !import.meta.env.DEV) { // not in the Vite dev server (it would cache dev modules)
    // Cache-first: the stored copy loads instantly; sw.js compares with the server in the
    // background and stores any new version for the next load.
    navigator.serviceWorker.addEventListener('message', (ev: MessageEvent) => {
      if (ev.data?.type === 'xtm-update-ready') {
        console.info('XTM: new version stored; update ready.');
        notifyUpdateAvailable();
      }
    });

    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      if (reg.waiting) {
        notifyUpdateAvailable();
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdateAvailable();
            }
          });
        }
      });
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  }
}
