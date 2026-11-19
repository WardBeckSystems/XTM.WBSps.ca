/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Standard VU movement (meterStyle 'standard_vu'): the classic ASA C16.5 face.
 * Engraving, span and pointers are the same as the Simpson movement; kept as its
 * own variant so it can diverge without touching the Simpson face.
 */
import type { VuFaceStyle } from '../face-types';
import { SIMPSON_STYLE } from './simpson';

export const STANDARD_VU_STYLE: VuFaceStyle = {
  isSifam: false,
  legend: SIMPSON_STYLE.legend,
  vuNeedle: SIMPSON_STYLE.vuNeedle,
  ppmNeedle: SIMPSON_STYLE.ppmNeedle
};
