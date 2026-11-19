/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** PPM face, ppmStandard 'fast_peak' - digital quasi-peak in dBFS: alignment -18 dBFS, red above -9 dBFS. */
import type { AltPpmFace } from './alt-face';

export const FAST_PEAK_FACE: AltPpmFace = {
  offset: -18, majors: [-30, -24, -18, -12, -6], minors: [-27, -21, -15, -9], redFrom: -9,
  caption: 'dBFS', fmt: (L) => String(L)
};
