/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Manifest update check: triggers orange pulse on Settings when a new version is available. */

let updateNotified = false;

/**
 * Triggers the orange pulse animation on Settings and adds an in-drawer update banner.
 */
export function notifyUpdateAvailable(newVersion?: string): void {
  if (updateNotified) return;
  updateNotified = true;

  document.body.classList.add('has-new-version');

  const btn = document.getElementById('btnOpenSettings');
  const lbl = document.querySelector('.drawer-gear-label');
  const toggleLeft = document.getElementById('drawerToggleLeft');

  if (btn) {
    btn.classList.add('has-update');
    btn.setAttribute('title', `New version available${newVersion ? ' (' + newVersion + ')' : ''}! Click Settings to update`);
  }

  if (lbl) {
    lbl.classList.add('has-update');
    if (!lbl.querySelector('.settings-update-dot')) {
      const dot = document.createElement('span');
      dot.className = 'settings-update-dot';
      dot.title = 'New update available';
      lbl.appendChild(dot);
    }
  }

  if (toggleLeft) {
    toggleLeft.classList.add('has-update');
  }

  // Prepend an update banner inside the Settings drawer if present
  const drawerGrid = document.querySelector('.drawer-grid');
  if (drawerGrid && !document.getElementById('updateAvailableBanner')) {
    const banner = document.createElement('div');
    banner.id = 'updateAvailableBanner';
    banner.className = 'update-available-banner';
    banner.innerHTML = `
      <span>⚡ New version available${newVersion ? ' (' + newVersion + ')' : ''}</span>
      <button type="button" id="btnReloadNewVersion">Reload &amp; Update Now</button>
    `;
    drawerGrid.parentElement?.insertBefore(banner, drawerGrid);
    document.getElementById('btnReloadNewVersion')?.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Update footer build-stamp if present
  const stamp = document.querySelector('.build-stamp');
  if (stamp) {
    stamp.innerHTML = `<span style="color:#f97316;cursor:pointer;font-weight:bold" title="Click to reload with new version">Update: ${newVersion || 'Available'} ⟳</span>`;
    stamp.addEventListener('click', () => window.location.reload());
  }
}

export function initUpdateCheck(): void {
  // Expose global test trigger so user/dev can verify the orange pulse at any time
  (window as any).testUpdatePulse = (ver = '2026.11.20') => notifyUpdateAvailable(ver);

  async function checkForUpdates() {
    try {
      const response = await fetch('./version.json?cache=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (version && version !== __BUILD_STAMP__) {
        notifyUpdateAvailable(version);
      }
    } catch (_) {
      // Offline or network error
    }
  }

  // Check 3 seconds after launch, every 60 seconds, and when tab regains focus
  setTimeout(checkForUpdates, 3000);
  setInterval(checkForUpdates, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  });

  const footer = document.querySelector('footer');
  if (footer) {
    const ver = document.createElement('div');
    ver.textContent = __BUILD_STAMP__;
    ver.style.fontSize = '10px';
    ver.style.color = '#777';
    footer.appendChild(ver);
  }
}
