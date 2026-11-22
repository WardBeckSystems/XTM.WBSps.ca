/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Meter style (VU face) and VU ballistics selectors. */

import { type AppContext, saveAppConfig } from './app-context';
import type { DrawerControls } from './dom-refs';

const lsGet = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

export function getMeterKey(): string {
  if (document.body.classList.contains('theme-mccurdy-dark')) return 'xtm.meter.v2.mccurdyDark';
  if (document.body.classList.contains('theme-mccurdy')) return 'xtm.meter.v2.mccurdyLight';
  if (document.body.classList.contains('theme-wbs-ca')) return 'xtm.meter.v2.wbsca';
  return 'xtm.meter.v2.wbsdark';
}

export function getDefaultMeterForMode(): string {
  if (document.body.classList.contains('theme-mccurdy-dark')) return 'mccurdy_vu'; // mccurdy.ca: authentic McCurdy broadcast console VU meter
  if (document.body.classList.contains('theme-mccurdy')) return 'fisam';       // Mccurdy.com: the sifam with minimal lighting
  if (document.body.classList.contains('theme-wbs-ca')) return 'mccurdy_vu';   // wardbeck.ca: the spade VU
  return 'fisam';                                                              // Wardbeck.com: the sifam
}

export function applyModeMeter(ctx: AppContext, selectMeterStyle?: HTMLSelectElement | null): void {
  const { model, audio, view } = ctx;
  const key = getMeterKey();
  const defaultMeter = getDefaultMeterForMode();
  const stored = lsGet(key);
  const meter = (stored === 'sifam') ? 'fisam' : (stored === 'simpson' || stored === 'pimsom') ? 'pimson' : (stored || defaultMeter);
  if (meter !== model.meterStyle) {
    model.meterStyle = meter as any;
    audio.setVuStyle(meter);
    view.isBuilt = false;
    model.notify();
  }
  if (selectMeterStyle) selectMeterStyle.value = model.meterStyle;
}

export function initMeterStyle(ctx: AppContext, refs: DrawerControls): void {
  const { model, audio, view } = ctx;
  const { selectMeterStyle } = refs;

  const onModeChange = () => applyModeMeter(ctx, selectMeterStyle);
  onModeChange();
  (window as any).applyModeMeter = onModeChange;
  new MutationObserver(onModeChange).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectMeterStyle) {
    selectMeterStyle.value = model.meterStyle;
    selectMeterStyle.addEventListener('change', (e: any) => {
      model.meterStyle = e.target.value;
      audio.setVuStyle(e.target.value);
      lsSet(getMeterKey(), model.meterStyle);
      model.saveEEPROM();
      view.isBuilt = false;
      model.notify();
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
