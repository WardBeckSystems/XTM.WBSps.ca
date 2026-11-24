/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Lower Console Bay views, picked from the Settings cog's drop-up menu:
 * loudness · data · routing · generators · transmitters · timing (then Settings).
 * - loudness:   dBFS / BS.1770 LUFS scope (always the view on load)
 * - data:       Scanalyzer Audio Eye & pipeline graph
 * - routing:    Web Router (inputs × outputs grid)
 * - generators: POD-33, ABS-1 Bit Spitter → ABB-1 Bit Buddy
 * - mxl:        one EBU DMF / MXL ring buffer per transmitter, then the CBC MXL test generator
 * - timing:     PTP grandmasters and clocks
 * - logging:    telemetry export and the TAP's live log
 */

export type LowerUnitMode = 'loudness' | 'data' | 'routing' | 'generators' | 'mxl' | 'timing' | 'logging' | 'settings';

const STAGES: Record<LowerUnitMode, { ids: string[]; display: string }> = {
  loudness: { ids: ['dbfsStage'], display: 'flex' },
  data: { ids: ['dataStage'], display: 'block' },
  routing: { ids: ['routingStage'], display: 'block' },
  generators: { ids: ['generatorsStage'], display: 'block' },
  mxl: { ids: ['mxlStage'], display: 'block' },
  timing: { ids: ['timingStage'], display: 'block' },
  logging: { ids: ['loggingStage'], display: 'block' },
  // Settings is a page like the others: the drawer is its body, open only while it is the view
  settings: { ids: ['settingsStage'], display: 'block' },
};

const MODES = Object.keys(STAGES) as LowerUnitMode[];

export function initLowerUnitSwitcher(): void {
  const menu = document.getElementById('footerViewMenu');
  const trigger = document.getElementById('btnOpenSettings');
  const currentName = document.getElementById('footerViewCurrentName');
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('#footerViewMenu [data-view]'));
  let currentMode: LowerUnitMode = 'loudness';

  // Settings cog opens a drop-up menu: the lower-bay views, then Settings.
  const isOpen = () => !!menu?.classList.contains('open');
  const setOpen = (open: boolean) => {
    menu?.classList.toggle('open', open);
    trigger?.classList.toggle('menu-open', open);
    trigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  // Room on the bar: the views sit in it as a row (and the cog is Settings); otherwise the
  // cog opens them as a drop-up.
  const left = document.getElementById('drawerToggleLeft');
  const bar = left?.parentElement as HTMLElement | null;
  const isInline = () => !!menu?.classList.contains('inline');
  const fit = () => {
    if (!menu || !left || !bar) return;
    setOpen(false);
    menu.classList.add('inline');
    left.classList.add('views-inline');
    bar.classList.add('fit-measure');
    const tight = bar.scrollWidth > bar.clientWidth + 1;
    bar.classList.remove('fit-measure');
    if (tight) {
      menu.classList.remove('inline');
      left.classList.remove('views-inline');
    }
  };
  trigger?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInline()) setMode(currentMode === 'settings' ? 'loudness' : 'settings');
    else setOpen(!isOpen());
  });
  // Settings is its own page: its cards leave the footer drawer for the lower bay, so only
  // one page shows at a time and the footer bar stays put.
  const drawerEl = document.getElementById('auxDrawer') as HTMLElement | null;
  const settingsStage = document.getElementById('settingsStage');
  const drawerGrid = drawerEl?.querySelector(':scope > .drawer-grid');
  if (settingsStage && drawerGrid) settingsStage.appendChild(drawerGrid);
  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (isOpen() && !menu?.contains(t) && !trigger?.contains(t)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); trigger?.focus(); }
  });

  const setMode = (mode: LowerUnitMode) => {
    currentMode = mode;
    for (const btn of buttons) {
      const on = btn.dataset.view === mode;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      btn.querySelector('.footer-view-led')?.classList.toggle('lit-green', on);
    }
    if (currentName) currentName.textContent = buttons.find((b) => b.dataset.view === mode)?.querySelector('.footer-view-name')?.textContent ?? mode;
    setOpen(false);
    trigger?.classList.toggle('settings-on', mode === 'settings');
    // One page at a time
    document.body.classList.toggle('xtm-settings-page', mode === 'settings');
    for (const m of MODES) {
      for (const id of STAGES[m].ids) {
        const el = document.getElementById(id);
        if (el) el.style.display = m === mode ? STAGES[m].display : 'none';
      }
    }

    // Routing and generators drive audio: make sure the context is running.
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
      e.preventDefault();
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

  if (bar) {
    let raf = 0;
    const refit = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); };
    new ResizeObserver(refit).observe(bar);
    document.fonts?.ready.then(refit).catch(() => {});
    refit();
  }

  (window as any).setLowerUnitMode = (m: LowerUnitMode) => { if (MODES.includes(m)) setMode(m); };
  (window as any).cycleLowerUnitMode = () => setMode(MODES[(MODES.indexOf(currentMode) + 1) % MODES.length]);
}
