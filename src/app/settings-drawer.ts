/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Settings drawer toggle: only the cog icon opens/closes the drawer. */

export function initSettingsDrawer(): void {
  const auxDrawer = document.getElementById('auxDrawer') as any;
  const btnOpenSettings = document.getElementById('btnOpenSettings');

  function toggleSettings(e?: Event) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (auxDrawer) {
      auxDrawer.open = !auxDrawer.open;
    }
  }

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', toggleSettings);
  }
  // Only the cog icon opens/closes Settings: clicks anywhere else on the bar
  // (label, empty space, logos) must not toggle the <details> drawer.
  const drawerSummary = auxDrawer?.querySelector('summary');
  if (drawerSummary) {
    drawerSummary.addEventListener('click', (e: Event) => {
      const t = e.target as Element | null;
      if (t && t.closest('#btnOpenSettings')) return; // handled by toggleSettings
      if (t && t.closest('a, button')) return;         // logos/McCurdy button do their own thing
      e.preventDefault();
    });
  }
}
