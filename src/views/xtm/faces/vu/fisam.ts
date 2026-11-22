/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * FISAM AL29 movement (meterStyle 'fisam', model default): +-50 deg span,
 * mirrored VU / VU legends above the scale, slender tapered wand pointers.
 */
import type { FaceCtx, VuFaceStyle } from '../face-types';
import type { NeedleParts } from '../../lib/needle';
import { ppmNeedleShadow } from '../../lib/needle';
import { R } from '../../layout/wbs-layout';
import { vuAngle, vuFrac } from '../../lib/scale-math';
import { VU_RED } from './vu-scale';

function legend(ctx: FaceCtx): string {
  const { P, ink } = ctx;
  // Black VU above -7 tick, red VU above +1 tick, mirrored about the centre line.
  const vuTagA = Math.abs(vuAngle(vuFrac(1), true));
  const [vuxL, vuyL] = P(-vuTagA, R + 72);
  const [vuxR, vuyR] = P(vuTagA, R + 72);
  // (No writing on the lower half of the VU face.)
  return `<text x="${vuxL.toFixed(1)}" y="${vuyL.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${ink}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>
              <text x="${vuxR.toFixed(1)}" y="${vuyR.toFixed(1)}" font-size="28" font-weight="800" text-anchor="middle" fill="${VU_RED}" font-family="'Arial Narrow', Arial, sans-serif">VU</text>`;
}

/** Slender tapered black wand with circular hub skirt cap */
function vuNeedle(px: number, py: number, R: number): NeedleParts {
  const topY = py - (R + 34);
  return {
    shadow: `
          <line x1="${px + 2}" y1="${py + 2}" x2="${px + 2}" y2="${topY + 4}" stroke="rgba(0,0,0,0.30)" stroke-width="3.2" stroke-linecap="round"/>
        `,
    body: `
          <polygon points="${px - 2.8},${py} ${px + 2.8},${py} ${px + 0.8},${topY} ${px - 0.8},${topY}" fill="#0b0c0e"/>
          <line x1="${px - 0.5}" y1="${py}" x2="${px - 0.5}" y2="${topY + 4}" stroke="rgba(255,255,255,0.35)" stroke-width="1.1"/>
          <circle cx="${px}" cy="${py}" r="8" fill="#0b0c0e"/>
          <circle cx="${px}" cy="${py}" r="3.5" fill="#334155"/>
        `
  };
}

/** Tapered luminous yellow PPM wand with round hub */
function ppmNeedle(px: number, py: number, R: number): NeedleParts {
  const topY = py - (R + 34);
  return {
    shadow: ppmNeedleShadow(px, py, topY),
    body: `
          <polygon points="${px - 3.8},${py} ${px + 3.8},${py} ${px + 1.2},${topY} ${px - 1.2},${topY}" fill="#ffd600"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY + 2}" stroke="#fffbe6" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="${px}" cy="${py}" r="7" fill="#14181f"/>
          <circle cx="${px}" cy="${py}" r="3" fill="#ffd600"/>
        `
  };
}

export const FISAM_STYLE: VuFaceStyle = { isFisam: true, isSifam: true, legend, vuNeedle, ppmNeedle };
export const SIFAM_STYLE = FISAM_STYLE;
