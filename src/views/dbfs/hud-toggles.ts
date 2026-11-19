/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* HUD element lookup and the trace on/off toggles (HUD checkboxes + settings drawer checkboxes). */

export type TraceKey = 'showChA' | 'showChB' | 'showSum' | 'showDiff' | 'showLufs' | 'showLufsS' | 'showLufsI';

/** Trace flag, its localStorage key, and the settings-drawer checkbox id. */
export const TRACE_TOGGLES: { key: TraceKey; storage: string; drawerId: string }[] = [
  { key: 'showChA', storage: 'xtm_scope_show_cha', drawerId: 'chkShowChA' },
  { key: 'showChB', storage: 'xtm_scope_show_chb', drawerId: 'chkShowChB' },
  { key: 'showSum', storage: 'xtm_scope_show_sum', drawerId: 'chkShowSum' },
  { key: 'showDiff', storage: 'xtm_scope_show_diff', drawerId: 'chkShowDiff' },
  { key: 'showLufs', storage: 'xtm_scope_show_lufs', drawerId: 'chkShowLufs' },
  { key: 'showLufsS', storage: 'xtm_scope_show_lufs_s', drawerId: 'chkShowLufsS' },
  { key: 'showLufsI', storage: 'xtm_scope_show_lufs_i', drawerId: 'chkShowLufsI' }
];

/** Cache the HUD readout, checkbox and row elements on the view. */
export function queryHudElements(v: DbfsView, container: HTMLElement): void {
  v.hudEl = container.querySelector('#dbfsHoverHud');
  v.hudChA = container.querySelector('#hudChA');
  v.hudChB = container.querySelector('#hudChB');
  v.hudSum = container.querySelector('#hudSum');
  v.hudDiff = container.querySelector('#hudDiff');
  v.hudLufsM = container.querySelector('#hudLufsM');
  v.hudLufsS = container.querySelector('#hudLufsS');
  v.hudLufsI = container.querySelector('#hudLufsI');
  v.hudLra = container.querySelector('#hudLra');
  v.hudMax = container.querySelector('#hudMax');
  v.hudClipRow = container.querySelector('#hudClipRow');
  v.hudClips = container.querySelector('#hudClips');
  v.hudTimeMode = container.querySelector('#hudTimeMode');
  v.wrapper = container.querySelector('.dbfs-canvas-wrapper');
  v.dockContainer = null;
  v.btnDock = container.querySelector('#btnDockHud');

  // HUD Trace Toggle Checkboxes
  v.hudChkChA = container.querySelector('#hudChkChA');
  v.hudChkChB = container.querySelector('#hudChkChB');
  v.hudChkSum = container.querySelector('#hudChkSum');
  v.hudChkDiff = container.querySelector('#hudChkDiff');
  v.hudChkLufsM = container.querySelector('#hudChkLufsM');
  v.hudChkLufsS = container.querySelector('#hudChkLufsS');
  v.hudChkLufsI = container.querySelector('#hudChkLufsI');

  v.hudRowChA = container.querySelector('#hudRowChA');
  v.hudRowChB = container.querySelector('#hudRowChB');
  v.hudRowSum = container.querySelector('#hudRowSum');
  v.hudRowDiff = container.querySelector('#hudRowDiff');
  v.hudRowLufsM = container.querySelector('#hudRowLufsM');
  v.hudRowLufsS = container.querySelector('#hudRowLufsS');
  v.hudRowLufsI = container.querySelector('#hudRowLufsI');
}

function hudPairs(v: DbfsView): [HTMLInputElement | null, HTMLElement | null, TraceKey][] {
  return [
    [v.hudChkChA, v.hudRowChA, 'showChA'],
    [v.hudChkChB, v.hudRowChB, 'showChB'],
    [v.hudChkSum, v.hudRowSum, 'showSum'],
    [v.hudChkDiff, v.hudRowDiff, 'showDiff'],
    [v.hudChkLufsM, v.hudRowLufsM, 'showLufs'],
    [v.hudChkLufsS, v.hudRowLufsS, 'showLufsS'],
    [v.hudChkLufsI, v.hudRowLufsI, 'showLufsI']
  ];
}

/** Sync HUD checkboxes, HUD row dimming and drawer checkboxes to the current trace flags. */
export function updateTraceToggles(v: DbfsView): void {
  const pairs = hudPairs(v);
  for (const [chk, , key] of pairs) if (chk) chk.checked = v[key];
  for (const [, row, key] of pairs) if (row) row.classList.toggle('trace-off', !v[key]);
  const drawer = TRACE_TOGGLES.map(t => document.getElementById(t.drawerId) as HTMLInputElement | null);
  TRACE_TOGGLES.forEach((t, i) => { const el = drawer[i]; if (el) el.checked = v[t.key]; });
  v.graphDirty = true;
}

/** Wire the HUD checkboxes: toggle the trace, persist it, re-sync everything. */
export function bindHudTraceToggles(v: DbfsView): void {
  hudPairs(v).forEach(([chk, , key], i) => {
    if (!chk) return;
    const storage = TRACE_TOGGLES[i].storage;
    chk.addEventListener('change', (e: any) => {
      v[key] = e.target.checked;
      localStorage.setItem(storage, String(v[key]));
      updateTraceToggles(v);
    });
  });
  v._updateTraceToggles = () => updateTraceToggles(v);
  updateTraceToggles(v);
}

/** Wire the settings-drawer trace checkboxes. */
export function bindDrawerTraceToggles(v: DbfsView): void {
  for (const t of TRACE_TOGGLES) {
    const chk = document.getElementById(t.drawerId) as HTMLInputElement | null;
    if (!chk) continue;
    chk.checked = v[t.key];
    chk.addEventListener('change', (e: any) => {
      v[t.key] = e.target.checked;
      localStorage.setItem(t.storage, String(v[t.key]));
      if (v._updateTraceToggles) v._updateTraceToggles();
    });
  }
}
