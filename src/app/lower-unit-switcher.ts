/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Lower Console Bay View Switcher:
 * Switches between Loudness Scope (dBFS & BS.1770 LUFS) and Data Stream Buffer & Matrix (EBU DMF / MXL).
 * Displays "loudness vs data stream" on the footer drawer bar.
 * Clicking toggles seamlessly between loudness mode and data stream.
 */

export type LowerUnitMode = 'loudness' | 'stream';

export function initLowerUnitSwitcher(): void {
  const switcherEl = document.getElementById('footerViewSwitcher');
  const btnLoudness = document.getElementById('btnViewLoudness');
  const btnStream = document.getElementById('btnViewStream');
  const ledLoudness = document.getElementById('ledViewLoudness');
  const ledStream = document.getElementById('ledViewStream');
  const dbfsStageEl = document.getElementById('dbfsStage');
  const routingStageEl = document.getElementById('routingStage');

  let currentMode: LowerUnitMode = 'loudness';

  const setMode = (mode: LowerUnitMode, persist = true) => {
    currentMode = mode;
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

    // Ensure audio stream output to the sound card remains active and unblocked
    if (!isLoudness) {
      try {
        const audio = (window as any).app?.audio;
        if (audio?.ctx && audio.ctx.state === 'suspended') {
          audio.ctx.resume().catch(() => {});
        }
      } catch {}
    }

    // Inform layout and canvas elements
    window.dispatchEvent(new Event('resize'));
  };

  const toggleMode = () => {
    const next: LowerUnitMode = currentMode === 'loudness' ? 'stream' : 'loudness';
    setMode(next, true);
  };

  // Clicking anywhere on the toggle switcher switches between Loudness and Data Stream
  switcherEl?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMode();
  });

  // Clicking specific buttons: clicking active button flips mode; clicking inactive switches to it
  btnLoudness?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentMode === 'loudness') {
      setMode('stream', true);
    } else {
      setMode('loudness', true);
    }
  });

  btnStream?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentMode === 'stream') {
      setMode('loudness', true);
    } else {
      setMode('stream', true);
    }
  });

  // Default mode: 'loudness' (as requested)
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
  (window as any).toggleLowerUnitMode = toggleMode;
}
