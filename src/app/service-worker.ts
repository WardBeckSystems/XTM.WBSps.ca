/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Service worker registration (cache-first offline app); skipped in the Vite dev server. */

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && !import.meta.env.DEV) { // not in the Vite dev server (it would cache dev modules)
    // Cache-first: the stored copy loads instantly; sw.js compares with the server in the
    // background and stores any new version for the next load.
    navigator.serviceWorker.addEventListener('message', (ev: MessageEvent) => {
      if (ev.data?.type === 'xtm-update-ready') console.info('XTM: new version stored; it will load next time.');
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  }
}
