/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import { PAL_MC } from './palette-mccurdy';

/** Palette follows the page mode (McCurdy = cream paper). Returns true in McCurdy mode. */
export function applyThemePalette(v: DbfsView): boolean {
  const mc = document.body.classList.contains('theme-mccurdy');
  if (!v.PAL_DARK) v.PAL_DARK = { ...v.PAL };
  v.PAL = mc ? { ...v.PAL_DARK, ...PAL_MC } : v.PAL_DARK;
  return mc;
}
