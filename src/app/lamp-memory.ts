/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Per-mode VU & PPM lamp memory & console background synchronization.
 */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';
import {
  lsGet,
  lsSet,
  getLampKey,
  getPpmLampKey,
  applyModeLamp,
  applyModePpmLamp,
  updateConsoleBg
} from './lamp-mode';

export {
  getLampKey,
  getPpmLampKey,
  getDefaultLampForMode,
  applyModeLamp,
  applyModePpmLamp,
  updateConsoleBg
} from './lamp-mode';

export function initLampMemory(ctx: AppContext, refs: DrawerControls): void {
  const { model, view } = ctx;
  const { selectLampColor, selectDialBg, selectPpmLampColor, selectPpmDialBg, selectConsoleBg } = refs;

  const onModeLampChange = () => applyModeLamp(ctx, selectLampColor);
  onModeLampChange();
  new MutationObserver(onModeLampChange).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectLampColor) {
    selectLampColor.value = model.dialLamp || 'amber';
    selectLampColor.addEventListener('change', (e: any) => {
      model.dialLamp = e.target.value;
      lsSet(getLampKey(), model.dialLamp);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  // Dial Background Memory & Selection
  const dialBgKey = 'xtm.dial.bg';
  const savedDialBg = lsGet(dialBgKey) || model.dialBg || 'auto';
  if (savedDialBg !== model.dialBg) {
    model.dialBg = savedDialBg;
  }
  if (selectDialBg) {
    selectDialBg.value = model.dialBg || 'auto';
    selectDialBg.addEventListener('change', (e: any) => {
      model.dialBg = e.target.value;
      lsSet(dialBgKey, model.dialBg);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  // PPM Lamp Memory & Selection
  const onModePpmLampChange = () => applyModePpmLamp(ctx, selectPpmLampColor);
  if (!lsGet('xtm.ppmLamp.dark')) lsSet('xtm.ppmLamp.dark', model.ppmLamp || 'unlit');
  onModePpmLampChange();
  new MutationObserver(onModePpmLampChange).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectPpmLampColor) {
    selectPpmLampColor.value = model.ppmLamp || 'unlit';
    selectPpmLampColor.addEventListener('change', (e: any) => {
      model.ppmLamp = e.target.value;
      lsSet(getPpmLampKey(), model.ppmLamp);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  // PPM Dial Background Memory & Selection
  const ppmDialBgKey = 'xtm.ppmDial.bg';
  const savedPpmDialBg = lsGet(ppmDialBgKey) || model.ppmDialBg || 'auto';
  if (savedPpmDialBg !== model.ppmDialBg) {
    model.ppmDialBg = savedPpmDialBg;
  }
  if (selectPpmDialBg) {
    selectPpmDialBg.value = model.ppmDialBg || 'auto';
    selectPpmDialBg.addEventListener('change', (e: any) => {
      model.ppmDialBg = e.target.value;
      lsSet(ppmDialBgKey, model.ppmDialBg);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }

  // Console / Chassis Background Mode Selection
  const onConsoleBgChange = () => updateConsoleBg(selectConsoleBg);
  onConsoleBgChange();
  new MutationObserver(onConsoleBgChange).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectConsoleBg) {
    selectConsoleBg.addEventListener('change', (e: any) => {
      const mode = e.target.value;
      if (typeof (window as any).setMode === 'function') {
        (window as any).setMode(mode);
      }
    });
  }
}
