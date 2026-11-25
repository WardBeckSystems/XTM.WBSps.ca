/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** PPM face, ppmStandard 'nordic' - Nordic N9: -12 .. TEST .. +12, red above +9 (PML). */
import type { AltPpmFace } from './alt-face';

export const NORDIC_FACE: AltPpmFace = {
  offset: 0, majors: [-12, -6, 0, 6, 9, 12], minors: [-9, -3, 3], redFrom: 9,
  caption: 'NORDIC', fmt: (L) => (L === 0 ? 'TEST' : L > 0 ? '+' + L : String(L))
};
