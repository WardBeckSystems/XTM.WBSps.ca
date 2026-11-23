/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Lower Console Bay tabs (footer): loudness · data · routing.
 * - loudness:   dBFS / BS.1770 LUFS scope (always the view on load)
 * - data:       Scanalyzer Audio Eye, MXL ring buffers & pipeline
 * - routing:    Web Router (inputs × outputs grid), then the generators
 *               under it: POD-33, CBC MXL, ABS-1 Bit Spitter → ABB-1 Bit Buddy
 */

export type LowerUnitMode = 'loudness' | 'data' | 'routing';

const STAGES: Record<LowerUnitMode, { ids: string[]; display: string }> = {
  loudness: { ids: ['dbfsStage'], display: 'flex' },
  data: { ids: ['dataStage'], display: 'block' },
  routing: { ids: ['routingStage'], display: 'block' }, // router grid, generators below it
};

const MODES = Object.keys(STAGES) as LowerUnitMode[];

export function initLowerUnitSwitcher(): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('#footerViewSwitcher [data-view]'));
  let currentMode: LowerUnitMode = 'loudness';

  const setMode = (mode: LowerUnitMode) => {
    currentMode = mode;
    for (const btn of buttons) {
      const on = btn.dataset.view === mode;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.querySelector('.footer-view-led')?.classList.toggle('lit-green', on);
    }
    for (const m of MODES) {
      for (const id of STAGES[m].ids) {
        const el = document.getElementById(id);
        if (el) el.style.display = m === mode ? STAGES[m].display : 'none';
      }
    }

    // Routing (with its generators) drives audio: make sure the context is running.
    if (mode !== 'loudness') {
      try {
        const audio = (window as any).xtmAudio;
        if (audio?.ctx && audio.ctx.state === 'suspended') audio.ctx.resume().catch(() => {});
      } catch {}
    }

    // Inform layout and canvas elements
    window.dispatchEvent(new Event('resize'));
  };

  for (const btn of buttons) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMode(btn.dataset.view as LowerUnitMode);
    });
  }

  // Loudness is always the default on load; the last tab is not restored.
  try {
    localStorage.removeItem('xtm.lower_unit_pref');
    localStorage.removeItem('xtm.lower_unit');
  } catch {}
  setMode('loudness');

  (window as any).setLowerUnitMode = (m: LowerUnitMode) => { if (MODES.includes(m)) setMode(m); };
  (window as any).cycleLowerUnitMode = () => setMode(MODES[(MODES.indexOf(currentMode) + 1) % MODES.length]);
}
