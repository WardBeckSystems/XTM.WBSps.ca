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
  const { selectLampColor, selectDialBg, selectConsoleBg } = refs;

  const lampKey = () => {
    if (document.body.classList.contains('theme-mccurdy')) return 'xtm.lamp.mccurdy';
    if (document.body.classList.contains('theme-wbs-ca')) return 'xtm.lamp.wbsca';
    return 'xtm.lamp.dark';
  };
  const applyModeLamp = () => {
    const mc = document.body.classList.contains('theme-mccurdy');
    const wbsCa = document.body.classList.contains('theme-wbs-ca');
    const defaultLamp = wbsCa ? 'amber_bottom' : (mc ? 'parchment' : 'amber');
    const lamp = lsGet(lampKey()) || defaultLamp;
    if (lamp !== model.dialLamp) {
      model.dialLamp = lamp;
      view.isBuilt = false;
    }
    if (selectLampColor) selectLampColor.value = model.dialLamp;
  };
  if (!lsGet('xtm.lamp.dark')) lsSet('xtm.lamp.dark', model.dialLamp || 'amber');
  if (!lsGet('xtm.lamp.wbsca')) lsSet('xtm.lamp.wbsca', 'amber_bottom');
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

  // Console / Chassis Background Mode Selection
  const updateConsoleBg = () => {
    if (!selectConsoleBg) return;
    if (document.body.classList.contains('theme-wbs-ca')) selectConsoleBg.value = 'wbs-ca';
    else if (document.body.classList.contains('theme-mccurdy-dark')) selectConsoleBg.value = 'mccurdy-dark';
    else if (document.body.classList.contains('theme-mccurdy')) selectConsoleBg.value = 'mccurdy-light';
    else selectConsoleBg.value = 'wbs-dark';
  };
  updateConsoleBg();
  new MutationObserver(updateConsoleBg).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (selectConsoleBg) {
    selectConsoleBg.addEventListener('change', (e: any) => {
      const mode = e.target.value;
      if (typeof (window as any).setMode === 'function') {
        (window as any).setMode(mode);
      }
    });
  }
}
