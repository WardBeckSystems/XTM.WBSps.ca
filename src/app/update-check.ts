/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Hourly manifest update check and footer build stamp. */

export function initUpdateCheck(): void {
  async function checkForUpdates() {
    try {
      const response = await fetch('./version.json?cache=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (version && version !== __BUILD_STAMP__) {
        if (confirm('A new update is available. Refresh to update?')) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Update check failed', e);
    }
  }
  if (!import.meta.env.DEV) setInterval(checkForUpdates, 3600000); // Hourly check

  const footer = document.querySelector('footer');
  if (footer) {
    const ver = document.createElement('div');
    ver.textContent = __BUILD_STAMP__;
    ver.style.fontSize = '10px';
    ver.style.color = '#777';
    footer.appendChild(ver);
  }
}
