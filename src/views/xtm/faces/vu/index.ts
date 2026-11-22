/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** VU movement style registry (meterStyle -> face style). */
import type { VuFaceStyle } from '../face-types';
import { FISAM_STYLE, SIFAM_STYLE } from './fisam';
import { PIMSON_STYLE, SIMPSON_STYLE, PIMSOM_STYLE } from './pimson';
import { STANDARD_VU_STYLE } from './standard-vu';
import { MCCURDY_VU_STYLE } from './mccurdy-vu';
import { WBS_M405_STYLE } from './wbs-m405';

const STYLES: Record<string, VuFaceStyle> = {
  fisam: FISAM_STYLE,
  sifam: SIFAM_STYLE,
  pimson: PIMSON_STYLE,
  pimsom: PIMSOM_STYLE,
  simpson: SIMPSON_STYLE,
  standard_vu: STANDARD_VU_STYLE,
  mccurdy_vu: MCCURDY_VU_STYLE,
  wbs_m405: WBS_M405_STYLE
};

/** Any style other than 'fisam' renders with the Pimson-family engraving. */
export function vuFaceStyle(meterStyle: string): VuFaceStyle {
  return STYLES[meterStyle] ?? PIMSON_STYLE;
}

export { renderVuScale, VU_RED } from './vu-scale';
export { FISAM_STYLE, SIFAM_STYLE } from './fisam';
export { PIMSON_STYLE, SIMPSON_STYLE, PIMSOM_STYLE } from './pimson';
