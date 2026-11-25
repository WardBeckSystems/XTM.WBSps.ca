/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/* Trace visibility & display options persisted in localStorage. */

export interface SavedScopeOptions {
  showChA: boolean;
  showChB: boolean;
  showSum: boolean;
  showDiff: boolean;
  showLufs: boolean;
  showLufsS: boolean;
  showLufsI: boolean;
  show0DbfsLine: boolean;
  isDocked: boolean;
}

function savedBool(key: string, dflt: boolean): boolean {
  const saved = localStorage.getItem(key);
  return saved !== null ? saved === 'true' : dflt;
}

/** Default: only the sum and the loudness are on by default. */
export function loadSavedScopeOptions(): SavedScopeOptions {
  return {
    showChA: savedBool('xtm_scope_show_cha', false),
    showChB: savedBool('xtm_scope_show_chb', false),
    showSum: savedBool('xtm_scope_show_sum', true),
    showDiff: savedBool('xtm_scope_show_diff', false),
    showLufs: savedBool('xtm_scope_show_lufs', true),
    showLufsS: savedBool('xtm_scope_show_lufs_s', false),
    showLufsI: savedBool('xtm_scope_show_lufs_i', false),
    show0DbfsLine: savedBool('xtm_scope_show_0dbfs', true), // 0 dBFS ceiling reference line default on
    isDocked: localStorage.getItem('xtm_hud_docked') === 'true' // Dock below right meter beside LED
  };
}
