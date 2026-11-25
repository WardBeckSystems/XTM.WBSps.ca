/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Per-mode lamp memory keys, default resolutions, and style application. */

import type { AppContext } from './app-context';

export const lsGet = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
export const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

export function getLampKey(): string {
  if (document.body.classList.contains('theme-mccurdy-dark')) return 'xtm.lamp.v2.mccurdyDark';
  if (document.body.classList.contains('theme-mccurdy')) return 'xtm.lamp.v2.mccurdyLight';
  if (document.body.classList.contains('theme-wbs-ca')) return 'xtm.lamp.v2.wbsca';
  return 'xtm.lamp.v2.wbsdark';
}

export function getDefaultLampForMode(): string {
  if (document.body.classList.contains('theme-wbs-ca')) return 'amber_bottom';
  if (document.body.classList.contains('theme-mccurdy')) return 'unlit';
  return 'amber';
}

export function applyModeLamp(ctx: AppContext, selectLampColor?: HTMLSelectElement | null): void {
  const { model, view } = ctx;
  const defaultLamp = getDefaultLampForMode();
  const lamp = lsGet(getLampKey()) || defaultLamp;
  if (lamp !== model.dialLamp) {
    model.dialLamp = lamp;
    view.isBuilt = false;
  }
  if (selectLampColor) selectLampColor.value = model.dialLamp;
}

export function getPpmLampKey(): string {
  if (document.body.classList.contains('theme-mccurdy-dark')) return 'xtm.ppmLamp.v2.mccurdyDark';
  if (document.body.classList.contains('theme-mccurdy')) return 'xtm.ppmLamp.v2.mccurdyLight';
  if (document.body.classList.contains('theme-wbs-ca')) return 'xtm.ppmLamp.v2.wbsca';
  return 'xtm.ppmLamp.v2.wbsdark';
}

export function applyModePpmLamp(ctx: AppContext, selectPpmLampColor?: HTMLSelectElement | null): void {
  const { model, view } = ctx;
  const lamp = lsGet(getPpmLampKey()) || 'unlit';
  if (lamp !== model.ppmLamp) {
    model.ppmLamp = lamp;
    view.isBuilt = false;
  }
  if (selectPpmLampColor) selectPpmLampColor.value = model.ppmLamp;
}

export function updateConsoleBg(selectConsoleBg?: HTMLSelectElement | null): void {
  if (!selectConsoleBg) return;
  if (document.body.classList.contains('theme-wbs-ca')) selectConsoleBg.value = 'wbs-ca';
  else if (document.body.classList.contains('theme-mccurdy-dark')) selectConsoleBg.value = 'mccurdy-dark';
  else if (document.body.classList.contains('theme-mccurdy')) selectConsoleBg.value = 'mccurdy-light';
  else selectConsoleBg.value = 'wbs-dark';
}
