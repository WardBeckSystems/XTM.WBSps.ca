/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Pro options: VFD metric selector and peak-sensitivity trim. */

import type { AppContext } from './app-context';

export function initVfdMetric(ctx: AppContext): void {
  const { model, audio } = ctx;
  const selectVfdMetric = document.getElementById('selectVfdMetric') as HTMLSelectElement | null;
  const selectPeakSens = document.getElementById('selectPeakSens') as HTMLSelectElement | null;

  if (selectVfdMetric) {
    selectVfdMetric.value = model.vfdMetric || 'lufs';
    selectVfdMetric.addEventListener('change', (e: any) => {
      model.vfdMetric = e.target.value;
      model.saveEEPROM();
    });
  }

  if (selectPeakSens) {
    selectPeakSens.addEventListener('change', (e: any) => {
      const val = parseFloat(e.target.value);
      audio.setPeakSensTrim(val);
    });
  }
}
