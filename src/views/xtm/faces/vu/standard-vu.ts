/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Standard VU movement (meterStyle 'standard_vu'): the classic ASA C16.5 face.
 * Engraving, span and pointers are the same as the Pimson movement; kept as its
 * own variant so it can diverge without touching the Pimson face.
 */
import type { VuFaceStyle } from '../face-types';
import { PIMSON_STYLE } from './pimson';

export const STANDARD_VU_STYLE: VuFaceStyle = {
  isFisam: false,
  isSifam: false,
  legend: PIMSON_STYLE.legend,
  vuNeedle: PIMSON_STYLE.vuNeedle,
  ppmNeedle: PIMSON_STYLE.ppmNeedle
};
