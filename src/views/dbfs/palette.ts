/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import { PAL_MC } from './palette-mccurdy';
import { PAL_WBS_CA } from './palette-wbs-ca';
import { PAL_MC_DARK } from './palette-mccurdy-dark';

/** Palette follows the page mode (Ward-Beck.ca = M600 cream aluminum, McCurdy = cream paper, McCurdy.ca = studio blue). */
export function applyThemePalette(v: DbfsView): boolean {
  if (!v.PAL_DARK) v.PAL_DARK = { ...v.PAL };

  const isWbsCa = document.body.classList.contains('theme-wbs-ca');
  const isMcLight = document.body.classList.contains('theme-mccurdy');
  const isMcDark = document.body.classList.contains('theme-mccurdy-dark');

  if (isWbsCa) {
    v.PAL = { ...v.PAL_DARK, ...PAL_WBS_CA };
    return true; // Light cream/champagne background
  } else if (isMcLight) {
    v.PAL = { ...v.PAL_DARK, ...PAL_MC };
    return true; // Light cream paper
  } else if (isMcDark) {
    v.PAL = { ...v.PAL_DARK, ...PAL_MC_DARK };
    return false; // Studio blue background
  } else {
    v.PAL = v.PAL_DARK;
    return false; // Dark mastering background
  }
}
