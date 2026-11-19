/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Hourly manifest update check and footer build stamp. */

export function initUpdateCheck(): void {
  async function checkForUpdates() {
    try {
      const response = await fetch('/manifest.json?cache=' + Date.now());
      const manifest = await response.json();
      if (manifest.version !== '1.1.0') {
        if (confirm('A new update is available. Refresh to update?')) {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Update check failed', e);
    }
  }
  setInterval(checkForUpdates, 3600000); // Hourly check

  const footer = document.querySelector('footer');
  if (footer) {
    const ver = document.createElement('div');
    ver.textContent = '2026.11.18.19.38';
    ver.style.fontSize = '10px';
    ver.style.color = '#777';
    footer.appendChild(ver);
  }
}
