/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** High-pass filter and input termination checkboxes. */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';

export function initFilterTerm(ctx: AppContext, refs: DrawerControls): void {
  const { model, audio } = ctx;
  const { chkHpf, chkTerm } = refs;

  if (chkHpf) {
    chkHpf.addEventListener('change', (e: any) => {
      model.hp = e.target.checked ? 1 : 0;
      audio.setHighPass(e.target.checked);
      model.saveEEPROM();
      model.notify();
    });
  }

  if (chkTerm) {
    chkTerm.addEventListener('change', (e: any) => {
      model.term = e.target.checked ? 1 : 0;
      model.saveEEPROM();
      model.notify();
    });
  }
}
