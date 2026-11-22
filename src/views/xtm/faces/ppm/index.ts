/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * PPM face registry (ppmStandard -> engraving).
 *   type2      WBS XTM4 face (default)
 *   type1      DIN 45406
 *   nordic     Nordic N9 (also the fallback for unknown non-type2 standards)
 *   fast_peak  digital quasi-peak in dBFS
 * The McCurdy ATS-100 PGM face is always emitted alongside (class mc-only).
 */
import type { FaceCtx } from '../face-types';
import type { AltPpmFace } from './alt-face';
import { renderAltPpmFace } from './alt-face';
import { DIN_TYPE1_FACE } from './din-type1';
import { NORDIC_FACE } from './nordic';
import { FAST_PEAK_FACE } from './fast-peak';
import { renderWbsType2Face } from './wbs-type2';
import { renderMcCurdyPgmFace } from './mccurdy-pgm';
import { R } from '../../layout/wbs-layout';
import { ppmAngle } from '../../lib/scale-math';

export { renderAltPpmFace };
export type { AltPpmFace };

const ALT_FACES: Record<string, AltPpmFace> = {
  type1: DIN_TYPE1_FACE,
  nordic: NORDIC_FACE,
  fast_peak: FAST_PEAK_FACE
};

/** Classic face table for a non-type2 standard */
export function altPpmFace(ppmStandard: string): AltPpmFace {
  return ALT_FACES[ppmStandard] ?? NORDIC_FACE;
}

/** Full PPM engraving: base arc, WBS-mode face for the standard, McCurdy PGM face */
export function renderPpmFace(ctx: FaceCtx, ppmStandard: string, isBlackPpm: boolean): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  let s = arc(ppmAngle(0, isFisam), ppmAngle(1, isFisam), R, 4, ink);
  s += `<g class="wbs-only">`;
  if (ppmStandard !== 'type2') {
    s += renderAltPpmFace(altPpmFace(ppmStandard), P, arc, ink, isFisam);
  } else {
    s += renderWbsType2Face(ctx, isBlackPpm);
  }
  s += `</g>`;
  s += renderMcCurdyPgmFace(ctx);
  return s;
}
