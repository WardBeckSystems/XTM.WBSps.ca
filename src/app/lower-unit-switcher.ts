/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Lower Console Bay View Switcher:
 * Switches between Loudness Scope (dBFS & BS.1770 LUFS) and Data Stream Buffer & Matrix (EBU DMF / MXL).
 * Displays "loudness vs data stream" on the footer drawer bar.
 */

export type LowerUnitMode = 'loudness' | 'stream';

export function initLowerUnitSwitcher(): void {
  const btnLoudness = document.getElementById('btnViewLoudness');
  const btnStream = document.getElementById('btnViewStream');
  const ledLoudness = document.getElementById('ledViewLoudness');
  const ledStream = document.getElementById('ledViewStream');
  const dbfsStageEl = document.getElementById('dbfsStage');
  const routingStageEl = document.getElementById('routingStage');

  const setMode = (mode: LowerUnitMode, persist = true) => {
    if (persist) {
      try {
        localStorage.setItem('xtm.lower_unit_pref', mode);
        localStorage.setItem('xtm.lower_unit', mode);
      } catch {}
    }

    const isLoudness = mode === 'loudness';

    if (btnLoudness) {
      btnLoudness.classList.toggle('active', isLoudness);
      btnLoudness.setAttribute('aria-selected', isLoudness ? 'true' : 'false');
    }
    if (btnStream) {
      btnStream.classList.toggle('active', !isLoudness);
      btnStream.setAttribute('aria-selected', !isLoudness ? 'true' : 'false');
    }

    if (ledLoudness) {
      ledLoudness.className = `footer-view-led ${isLoudness ? 'lit-green' : ''}`;
    }
    if (ledStream) {
      ledStream.className = `footer-view-led ${!isLoudness ? 'lit-green' : ''}`;
    }

    if (dbfsStageEl) {
      dbfsStageEl.style.display = isLoudness ? 'flex' : 'none';
    }
    if (routingStageEl) {
      routingStageEl.style.display = !isLoudness ? 'block' : 'none';
    }

    // Inform layout and canvas elements
    window.dispatchEvent(new Event('resize'));
  };

  btnLoudness?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMode('loudness', true);
  });

  btnStream?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMode('stream', true);
  });

  // Default mode: 'loudness' (as requested) or user preference if explicitly set
  let initialMode: LowerUnitMode = 'loudness';
  try {
    const saved = localStorage.getItem('xtm.lower_unit_pref');
    if (saved === 'loudness' || saved === 'stream') {
      initialMode = saved;
    } else {
      // Clear legacy auto-saved 'stream' default from previous release
      localStorage.removeItem('xtm.lower_unit');
    }
  } catch {}

  setMode(initialMode, false);
  (window as any).setLowerUnitMode = (m: LowerUnitMode) => setMode(m, true);
}
