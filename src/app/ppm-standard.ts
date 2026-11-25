/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** PPM ballistics standard: drives the audio engine and the PPM face (view.ppmStandard). */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';

export function initPpmStandard(ctx: AppContext, refs: DrawerControls): void {
  const { audio, view } = ctx;
  const { selectPpmBallistics } = refs;
  if (!selectPpmBallistics) return;

  selectPpmBallistics.value = audio.ppmBallisticPreset || 'type2';
  view.ppmStandard = selectPpmBallistics.value;
  view.isBuilt = false;
  selectPpmBallistics.addEventListener('change', (e: any) => {
    audio.setPpmType(e.target.value);
    view.ppmStandard = e.target.value;   // PPM face follows the chosen standard
    view.isBuilt = false;
    saveAppConfig(ctx);
  });
}
