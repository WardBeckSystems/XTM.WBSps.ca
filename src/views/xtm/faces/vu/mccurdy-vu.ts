/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy SA14023 Extended Range Audio Level Meter VU Face:
 * - Upper Arc: -20 to 0 VU (black/ink), 0 to +3 VU (red overload bar)
 * - Lower Subscale: 0 to 100% modulation scale ENTIRELY IN RED (#dc2626)
 *   as specified for mccurdy.ca and vintage McCurdy broadcast consoles.
 * - Vintage McCurdy shield / banner cartouche on dial face.
 * - Vintage teardrop needle movement.
 */
import type { FaceCtx, VuFaceStyle } from '../face-types';
import { R, MW } from '../../layout/wbs-layout';
import { vuAngle, vuFrac } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';
import { SIMPSON_STYLE } from './simpson';
import { VU_RED } from './vu-scale';

const INTERMEDIATE_TICKS = [-15, -8.5, -6, -4, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
const MAJOR_TICKS = [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3];
const PERCENT_POINTS = [
  { pc: 0, d: -20 },
  { pc: 20, d: -14 },
  { pc: 40, d: -8 },
  { pc: 60, d: -4.4 },
  { pc: 80, d: -1.9 },
  { pc: 100, d: 0 }
];

function legend(ctx: FaceCtx): string {
  const { ink, x0, y0 } = ctx;
  return `<text x="${(x0 + 56).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${ink}">VU</text>
          <text x="${(x0 + MW - 56).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${VU_RED}" text-anchor="end">VU</text>`;
}

export function renderMcCurdyScale(ctx: FaceCtx): string {
  const { P, arc, ink, isSifam } = ctx;
  const redBandCol = VU_RED;
  let s = '';

  // 1. Upper VU Scale Arcs: -20 to 0 VU black, 0 to +3 VU red overload band
  s += arc(vuAngle(vuFrac(-20), isSifam), vuAngle(vuFrac(0), isSifam), R, 3.8, ink);
  s += arc(vuAngle(vuFrac(0), isSifam), vuAngle(vuFrac(3), isSifam), R + 3, 10, redBandCol);

  // 2. Intermediate ticks (-15 to +2.5 VU)
  INTERMEDIATE_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isSifam);
    const tickLen = Math.abs(d) <= 3 ? 12 : 14;
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + tickLen, col, Math.abs(d) <= 3 ? '2.5' : '3');
  });

  // 3. Major ticks + numerals (-20 to +3 VU)
  MAJOR_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isSifam);
    const [tx, ty] = P(a, R + 46);
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + 24, col, '4.2') + `
      <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
  });

  // 4. Lower Red Modulation Arc under Percentage scale (0 to 100%)
  s += arc(vuAngle(vuFrac(-20), isSifam), vuAngle(vuFrac(0), isSifam), R - 10, 2.2, redBandCol);

  // 5. Percentage sub-scale dots & numbers (0, 20, 40, 60, 80, 100%) — ALL IN RED for McCurdy
  PERCENT_POINTS.forEach(({ pc, d }) => {
    const a = vuAngle(vuFrac(d), isSifam);
    const [x1, y1] = P(a, R - 10), [tx, ty] = P(a, R - 34);
    s += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.2" fill="${redBandCol}"/>
      <text x="${tx.toFixed(1)}" y="${(ty + 6).toFixed(1)}" font-size="16" font-weight="800" text-anchor="middle" fill="${redBandCol}">${pc}</text>`;
  });

  return s;
}

export function renderMcCurdyFaceLogo(cx: number, cy: number, ink: string): string {
  return `<g id="mccurdy-dial-logo" transform="translate(${(cx - 42).toFixed(1)}, ${(cy + 34).toFixed(1)})">
      <!-- Authentic McCurdy Cartouche Box & Wordmark -->
      <rect x="0" y="0" width="84" height="28" rx="2.5"
            fill="none" stroke="${ink}" stroke-width="1.5" stroke-opacity="0.85" />
      <text x="42" y="19"
            font-family="'Arial Black', Helvetica, Arial, sans-serif"
            font-size="13.5" font-weight="900" letter-spacing="-0.6" text-anchor="middle"
            fill="none" stroke="${ink}" stroke-width="1.2" stroke-opacity="0.9">McCurdy</text>
    </g>`;
}

export const MCCURDY_VU_STYLE: VuFaceStyle = {
  isSifam: false,
  legend,
  vuNeedle: SIMPSON_STYLE.vuNeedle,
  ppmNeedle: SIMPSON_STYLE.ppmNeedle,
  renderScale: renderMcCurdyScale,
  faceLogo: renderMcCurdyFaceLogo
};
