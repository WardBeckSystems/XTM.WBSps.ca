/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Input gain trim and headphone/monitor controls. */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';

export function initInputMonitor(ctx: AppContext, refs: DrawerControls): void {
  const { audio } = ctx;
  const { inputGainSlider, inputGainVal, chkMonitor, monitorVolSlider, monitorVolVal } = refs;

  if (inputGainSlider) {
    inputGainSlider.addEventListener('input', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setInputTrim(val);
      if (inputGainVal) inputGainVal.textContent = (val > 0 ? '+' : '') + val.toFixed(1) + ' dB';
    });
  }

  if (chkMonitor) {
    chkMonitor.addEventListener('change', (e: any) => {
      audio.setMonitor(e.target.checked);
    });
  }

  if (monitorVolSlider) {
    monitorVolSlider.addEventListener('input', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setMonitorVolume(val);
      if (monitorVolVal) monitorVolVal.textContent = Math.round(val * 100) + '%';
    });
  }
}
