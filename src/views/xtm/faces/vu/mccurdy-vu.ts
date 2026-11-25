/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy SA14023 Big Vintage Audio Level Meter VU Face:
 * Directly derived from authentic vintage McCurdy reference / gemini-svg (14).svg:
 * - Upper Arc: -20 to 0 VU in authentic warm ink (#2d2924), 0 to +3 VU in rich red (#c83728)
 * - Numerals: -20..-1 in #2d2924, 0..+3 in #c83728
 * - Left "VU" in #524a3e, Right "VU" in #b83b2a
 * - Lower Subscale: 0 to 100% modulation scale (0..80 in #2d2924, 100 in #c83728)
 * - Authentic tapered needle shaft with teardrop spade tip
 * - Authentic McCurdy brand badge with small-scale legibility optimization
 */
import type { FaceCtx, VuFaceStyle } from '../face-types';
import type { NeedleParts } from '../../lib/needle';
import { R, MW } from '../../layout/wbs-layout';
import { vuAngle, vuFrac } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';
import { PIMSON_STYLE } from './pimson';
import { renderMcCurdyVuBadge } from '../../skins/mccurdy/vu-badge';

const MCCURDY_INK = '#2d2924';
const MCCURDY_RED = '#c83728';

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
  const { x0, y0 } = ctx;
  return `<text x="${(x0 + 58).toFixed(0)}" y="${y0 + 64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#524a3e" letter-spacing="0.5">VU</text>
          <text x="${(x0 + MW - 58).toFixed(0)}" y="${y0 + 64}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="bold" fill="#b83b2a" letter-spacing="0.5" text-anchor="end">VU</text>`;
}

export function renderMcCurdyScale(ctx: FaceCtx): string {
  const { P, arc } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  let s = '';

  // 1. Upper VU Scale Arcs: -20 to 0 VU in black ink (#2d2924), 0 to +3 VU in red (#c83728)
  s += arc(vuAngle(vuFrac(-20), isFisam), vuAngle(vuFrac(0), isFisam), R, 2.0, MCCURDY_INK);
  s += arc(vuAngle(vuFrac(0), isFisam), vuAngle(vuFrac(3), isFisam), R + 1, 3.2, MCCURDY_RED);

  // 2. Intermediate ticks (-15 to +2.5 VU)
  INTERMEDIATE_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const tickLen = Math.abs(d) <= 3 ? 12 : 14;
    const col = d > 0 ? MCCURDY_RED : MCCURDY_INK;
    s += tickLine(P, a, R, R + tickLen, col, Math.abs(d) <= 3 ? '2.2' : '2.6');
  });

  // 3. Major ticks + numerals (-20 to +3 VU)
  MAJOR_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [tx, ty] = P(a, R + 44);
    const col = d >= 0 ? MCCURDY_RED : MCCURDY_INK;
    s += tickLine(P, a, R, R + 22, col, '3.2') + `
      <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
  });

  // 4. Lower Modulation Arc under Percentage scale (0 to 100%)
  s += arc(vuAngle(vuFrac(-20), isFisam), vuAngle(vuFrac(0), isFisam), R - 10, 1.8, MCCURDY_INK);

  // 5. Percentage sub-scale dots & numbers (0, 20, 40, 60, 80, 100%)
  PERCENT_POINTS.forEach(({ pc, d }) => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [x1, y1] = P(a, R - 10), [tx, ty] = P(a, R - 32);
    const col = pc === 100 ? MCCURDY_RED : MCCURDY_INK;
    s += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="3.2" fill="${col}"/>
      <text x="${tx.toFixed(1)}" y="${(ty + 6).toFixed(1)}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="${col}">${pc}</text>`;
  });

  return s;
}

export function mccurdyVuNeedle(px: number, py: number, R: number): NeedleParts {
  const topY = py - (R + 17);
  const sx = 2;
  const sy = 2;
  return {
    shadow: `
      <!-- McCurdy Authentic Vintage Needle Drop Shadow -->
      <path d="
        M ${px + sx} ${topY + sy}
        C ${px + 1.2 + sx} ${topY + 4 + sy}, ${px + 3.8 + sx} ${topY + 8 + sy}, ${px + 5.2 + sx} ${topY + 13 + sy}
        C ${px + 5.8 + sx} ${topY + 16 + sy}, ${px + 5.2 + sx} ${topY + 19 + sy}, ${px + 3.2 + sx} ${topY + 22 + sy}
        C ${px + 2.0 + sx} ${topY + 24 + sy}, ${px + 1.2 + sx} ${topY + 26 + sy}, ${px + 1.0 + sx} ${topY + 29 + sy}
        L ${px + 1.3 + sx} ${py + sy}
        L ${px - 1.3 + sx} ${py + sy}
        L ${px - 1.0 + sx} ${topY + 29 + sy}
        C ${px - 1.2 + sx} ${topY + 26 + sy}, ${px - 2.0 + sx} ${topY + 24 + sy}, ${px - 3.2 + sx} ${topY + 22 + sy}
        C ${px - 5.2 + sx} ${topY + 19 + sy}, ${px - 5.8 + sx} ${topY + 16 + sy}, ${px - 3.8 + sx} ${topY + 8 + sy}
        C ${px - 1.2 + sx} ${topY + 4 + sy}, ${px + sx} ${topY + sy}, ${px + sx} ${topY + sy}
        Z" fill="rgba(0,0,0,0.30)"/>
      <circle cx="${px + sx}" cy="${py + sy}" r="11" fill="rgba(0,0,0,0.25)"/>
    `,
    body: `
      <!-- McCurdy Authentic Vintage Needle with Classic Teardrop Pointer -->
      <path d="
        M ${px} ${topY}
        C ${px + 1.2} ${topY + 4}, ${px + 3.8} ${topY + 8}, ${px + 5.2} ${topY + 13}
        C ${px + 5.8} ${topY + 16}, ${px + 5.2} ${topY + 19}, ${px + 3.2} ${topY + 22}
        C ${px + 2.0} ${topY + 24}, ${px + 1.2} ${topY + 26}, ${px + 1.0} ${topY + 29}
        L ${px + 1.3} ${py}
        L ${px - 1.3} ${py}
        L ${px - 1.0} ${topY + 29}
        C ${px - 1.2} ${topY + 26}, ${px - 2.0} ${topY + 24}, ${px - 3.2} ${topY + 22}
        C ${px - 5.2} ${topY + 19}, ${px - 5.8} ${topY + 16}, ${px - 3.8} ${topY + 8}
        C ${px - 1.2} ${topY + 4}, ${px} ${topY}, ${px} ${topY}
        Z" fill="#1e1b18"/>
      
      <!-- Subtle needle spine ridge highlight -->
      <line x1="${px - 0.4}" y1="${py - 8}" x2="${px - 0.4}" y2="${topY + 10}" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>

      <!-- Center Pivot Hub & Concentric Screws -->
      <circle cx="${px}" cy="${py}" r="11" fill="#141517" stroke="#2a2d33" stroke-width="1.2"/>
      <circle cx="${px}" cy="${py}" r="5.5" fill="#090a0c"/>
      <circle cx="${px}" cy="${py}" r="2" fill="#4b5059"/>
    `
  };
}

export function renderMcCurdyFaceLogo(cx: number, cy: number, ink: string): string {
  return renderMcCurdyVuBadge(cx, cy, ink, false);
}

export const MCCURDY_VU_STYLE: VuFaceStyle = {
  isFisam: false,
  isSifam: false,
  legend,
  vuNeedle: mccurdyVuNeedle,
  ppmNeedle: PIMSON_STYLE.ppmNeedle,
  renderScale: renderMcCurdyScale
};
