/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** POD-22 options: extended LED range, scale mode, peak hold and decay. */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';

/** Restore and bind the extended 22-LED range checkbox (persisted in localStorage). */
export function initPodExtendedRange(ctx: AppContext): void {
  const { podView } = ctx;
  const chkExtendedLed22 = document.getElementById('chkExtendedLed22') as HTMLInputElement | null;
  if (chkExtendedLed22 && podView) {
    const savedExtended = localStorage.getItem('xtm_extended_led22');
    const isExt = savedExtended !== null ? savedExtended === 'true' : true;
    chkExtendedLed22.checked = isExt;
    podView.setExtendedRange(isExt);

    chkExtendedLed22.addEventListener('change', (e: any) => {
      podView.setExtendedRange(e.target.checked);
      try { localStorage.setItem('xtm_extended_led22', e.target.checked); } catch (_) {}
    });
  }
}

/** Scale mode and peak-hold DIP switch. */
export function initPodScaleAndHold(ctx: AppContext, refs: DrawerControls): void {
  const { podView } = ctx;
  const { chkPodHold } = refs;

  const selectPodScale = document.getElementById('selectPodScale') as HTMLSelectElement | null;
  if (selectPodScale && podView) {
    selectPodScale.value = podView.scaleMode;
    selectPodScale.addEventListener('change', (e: any) => {
      podView.scaleMode = e.target.value;
    });
  }

  if (chkPodHold) {
    chkPodHold.addEventListener('change', (e: any) => {
      podView.dip.BS1 = e.target.checked ? 1 : 0;
    });
  }
}

/** Decay ballistics. */
export function initPodDecay(ctx: AppContext, refs: DrawerControls): void {
  const { podView } = ctx;
  const { selectPodDecay } = refs;
  if (selectPodDecay) {
    selectPodDecay.value = podView.decayType || 'type2';
    selectPodDecay.addEventListener('change', (e: any) => {
      podView.setDecay(e.target.value);
      saveAppConfig(ctx);
    });
  }
}
