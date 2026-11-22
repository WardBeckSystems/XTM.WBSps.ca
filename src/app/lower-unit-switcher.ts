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

  const setMode = (mode: LowerUnitMode) => {
    try {
      localStorage.setItem('xtm.lower_unit', mode);
    } catch {}

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
    setMode('loudness');
  });

  btnStream?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMode('stream');
  });

  // Default mode: 'stream' (as currently visible in routing console) or persisted preference
  let initialMode: LowerUnitMode = 'stream';
  try {
    const saved = localStorage.getItem('xtm.lower_unit');
    if (saved === 'loudness' || saved === 'stream') {
      initialMode = saved;
    }
  } catch {}

  setMode(initialMode);
  (window as any).setLowerUnitMode = setMode;
}
