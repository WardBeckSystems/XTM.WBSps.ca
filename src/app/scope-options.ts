/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** dBFS scope options: loudness reset, log warp and time scale. */

import { type AppContext, saveAppConfig } from './app-context';

export function initScopeOptions(ctx: AppContext): void {
  const { audio, dbfsView } = ctx;

  if (dbfsView) {
    dbfsView.onClear = () => {
      audio.resetLoudness();
    };
  }

  const selectScopeLogWarp = document.getElementById('selectScopeLogWarp') as HTMLSelectElement | null;
  if (selectScopeLogWarp && dbfsView) {
    selectScopeLogWarp.addEventListener('change', (e: any) => {
      dbfsView.setBeta(parseFloat(e.target.value));
    });
  }

  const selectTimeScale = document.getElementById('selectTimeScale') as HTMLSelectElement | null;
  if (selectTimeScale && dbfsView) {
    selectTimeScale.value = dbfsView.timeMode;
    selectTimeScale.addEventListener('change', (e: any) => {
      dbfsView.setTimeMode(e.target.value);
    });
    dbfsView.onTimeModeChange = (mode) => {
      selectTimeScale.value = mode;
      saveAppConfig(ctx);
    };
  }
}
