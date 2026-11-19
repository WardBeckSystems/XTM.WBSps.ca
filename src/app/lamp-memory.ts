/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Per-mode VU lamp memory: dark (Ward-Beck) keeps the saved choice, McCurdy (light)
 * mode defaults to vintage parchment but may be switched to amber etc.
 */

import type { AppContext } from './app-context';
import type { DrawerControls } from './dom-refs';

const lsGet = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

export function initLampMemory(ctx: AppContext, refs: DrawerControls): void {
  const { model, view } = ctx;
  const { selectLampColor } = refs;

  const lampKey = () => document.body.classList.contains('theme-mccurdy') ? 'xtm.lamp.mccurdy' : 'xtm.lamp.dark';
  const applyModeLamp = () => {
    const mc = document.body.classList.contains('theme-mccurdy');
    const lamp = lsGet(lampKey()) || (mc ? 'parchment' : (model.dialLamp || 'amber'));
    if (lamp !== model.dialLamp) {
      model.dialLamp = lamp;
      view.isBuilt = false;
    }
    if (selectLampColor) selectLampColor.value = model.dialLamp;
  };
  if (!lsGet('xtm.lamp.dark')) lsSet('xtm.lamp.dark', model.dialLamp || 'amber');
  applyModeLamp();
  new MutationObserver(applyModeLamp).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectLampColor) {
    selectLampColor.value = model.dialLamp || 'amber';
    selectLampColor.addEventListener('change', (e: any) => {
      model.dialLamp = e.target.value;
      lsSet(lampKey(), model.dialLamp);
      model.saveEEPROM();
      view.isBuilt = false;
    });
  }
}
