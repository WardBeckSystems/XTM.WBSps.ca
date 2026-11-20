/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** VU movement style registry (meterStyle -> face style). */
import type { VuFaceStyle } from '../face-types';
import { SIFAM_STYLE } from './sifam';
import { SIMPSON_STYLE } from './simpson';
import { STANDARD_VU_STYLE } from './standard-vu';
import { MCCURDY_VU_STYLE } from './mccurdy-vu';
import { WBS_M405_STYLE } from './wbs-m405';

const STYLES: Record<string, VuFaceStyle> = {
  sifam: SIFAM_STYLE,
  simpson: SIMPSON_STYLE,
  standard_vu: STANDARD_VU_STYLE,
  mccurdy_vu: MCCURDY_VU_STYLE,
  wbs_m405: WBS_M405_STYLE
};

/** Any style other than 'sifam' renders with the Simpson-family engraving. */
export function vuFaceStyle(meterStyle: string): VuFaceStyle {
  return STYLES[meterStyle] ?? SIMPSON_STYLE;
}

export { renderVuScale, VU_RED } from './vu-scale';
