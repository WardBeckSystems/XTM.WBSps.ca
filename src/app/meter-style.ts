/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Meter style (VU face) and VU ballistics selectors. */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';

export function initMeterStyle(ctx: AppContext, refs: DrawerControls): void {
  const { model, audio, view } = ctx;
  const { selectMeterStyle } = refs;

  if (selectMeterStyle) {
    selectMeterStyle.value = model.meterStyle;
    selectMeterStyle.addEventListener('change', (e: any) => {
      model.meterStyle = e.target.value;
      audio.setVuStyle(e.target.value);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  const selectVuBallistics = document.getElementById('selectVuBallistics') as HTMLSelectElement | null;
  if (selectVuBallistics) {
    selectVuBallistics.value = audio.vuBallisticPreset || 'standard_vu';
    selectVuBallistics.addEventListener('change', (e: any) => {
      audio.setVuBallisticPreset(e.target.value);
      saveAppConfig(ctx);
    });
  }
}
