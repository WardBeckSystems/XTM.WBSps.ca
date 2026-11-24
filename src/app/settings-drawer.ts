/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Settings drawer: opened from the SETTINGS item of the cog's drop-up menu (lower-unit-switcher). */

export function initSettingsDrawer(): void {
  const auxDrawer = document.getElementById('auxDrawer') as any;
  // Only the menu's SETTINGS item opens/closes the drawer: clicks anywhere else on the bar
  // (label, empty space, logos) must not toggle the <details> drawer.
  const drawerSummary = auxDrawer?.querySelector('summary');
  if (drawerSummary) {
    drawerSummary.addEventListener('click', (e: Event) => {
      const t = e.target as Element | null;
      if (t && t.closest('a, button')) return;         // logos/McCurdy button do their own thing
      e.preventDefault();
    });
  }
}
