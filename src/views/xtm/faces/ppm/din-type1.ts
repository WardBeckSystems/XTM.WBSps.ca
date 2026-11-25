/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** PPM face, ppmStandard 'type1' - DIN 45406: dB scale, alignment -9, permitted max 0, red 0 .. +3. */
import type { AltPpmFace } from './alt-face';

export const DIN_TYPE1_FACE: AltPpmFace = {
  offset: -9, majors: [-20, -15, -10, -5, 0, 3], minors: [-17.5, -12.5, -7.5, -2.5, 1, 2], redFrom: 0,
  caption: 'DIN', fmt: (L) => (L > 0 ? '+' + L : String(L))
};
