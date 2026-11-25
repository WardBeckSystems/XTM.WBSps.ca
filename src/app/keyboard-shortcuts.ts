/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Keyboard shortcuts (M: Mode, S: Source, Up/Down: Trim, H: Setup, P: Power). */

import type { AppContext } from './app-context';
import type { AudioSync } from './audio-sync';

export function initKeyboardShortcuts(ctx: AppContext, sync: AudioSync): void {
  const { model } = ctx;
  window.addEventListener('keydown', (e: any) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const k = e.key.toUpperCase();
    if (k === 'M') {
      model.pressMode();
      sync.syncAudioWithHardwareMode(model);
    } else if (k === 'S') {
      model.pressSource();
      sync.syncAudioWithHardwareMode(model);
    } else if (k === 'ARROWDOWN' || k === 'D') {
      model.pressDown();
    } else if (k === 'ARROWUP' || k === 'U') {
      model.pressUp();
    } else if (k === 'H') {
      model.holdMode();
    } else if (k === 'P') {
      model.togglePower();
    } else if (k === 'T') {
      window.dispatchEvent(new CustomEvent('xtm:open-clock'));
    }
  });
}
