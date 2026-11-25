/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems M405 Extended Range VU Movement:
 * - Rotated upper VU labels (-26 deg left, +26 deg right).
 * - ANSI -20 to 0 VU black arc with major/minor ticks.
 * - +1 to +3 VU red overload bar.
 * - Lower modulation scale (20 to 100%).
 * - Small WBS Cartouche logo.
 * - Orange R244 G144 B44 pointer needle.
 */
import type { FaceCtx, VuFaceStyle } from '../face-types';
import type { NeedleParts } from '../../lib/needle';
import { ppmNeedleShadow } from '../../lib/needle';
import { R, MW } from '../../layout/wbs-layout';
import { vuAngle, vuFrac } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';
import { VU_RED } from './vu-scale';

const ORANGE_NEEDLE = 'rgb(244, 144, 44)'; // R244 G144 B44

const INTERMEDIATE_TICKS = [-15, -8.5, -6, -4, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
const MAJOR_TICKS = [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3];
const PERCENT_POINTS = [
  { pc: 20, d: -14 },
  { pc: 40, d: -8 },
  { pc: 60, d: -4.4 },
  { pc: 80, d: -1.9 },
  { pc: 100, d: 0 }
];

function legend(ctx: FaceCtx): string {
  const { ink, x0, y0 } = ctx;
  const lx = x0 + 60, rx = x0 + MW - 60, ty = y0 + 52;
  return `
    <text x="${lx.toFixed(0)}" y="${ty.toFixed(0)}" font-size="24" font-weight="700" fill="${ink}" transform="rotate(-26, ${lx.toFixed(0)}, ${ty.toFixed(0)})" letter-spacing="0.5">VU</text>
    <text x="${rx.toFixed(0)}" y="${ty.toFixed(0)}" font-size="24" font-weight="700" fill="${VU_RED}" transform="rotate(26, ${rx.toFixed(0)}, ${ty.toFixed(0)})" letter-spacing="0.5" text-anchor="end">VU</text>`;
}

export function renderWbsM405Scale(ctx: FaceCtx): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  const redBandCol = VU_RED;
  let s = '';

  // 1. Black Scale Arc (-20 to 0 VU)
  s += arc(vuAngle(vuFrac(-20), isFisam), vuAngle(vuFrac(0), isFisam), R, 3.8, ink);

  // 2. Red Overload Bar (0 to +3 VU)
  s += arc(vuAngle(vuFrac(0), isFisam), vuAngle(vuFrac(3), isFisam), R + 3, 10, redBandCol);

  // 3. Intermediate Ticks
  INTERMEDIATE_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const tickLen = Math.abs(d) <= 3 ? 12 : 14;
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + tickLen, col, Math.abs(d) <= 3 ? '2.5' : '3');
  });

  // 4. Major Ticks + Numerals
  MAJOR_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [tx, ty] = P(a, R + 46);
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + 24, col, '4.2') + `
      <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
  });

  // 5. Lower Modulation Percentage Scale (20 - 100%)
  PERCENT_POINTS.forEach(({ pc, d }) => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [x1, y1] = P(a, R - 10), [tx, ty] = P(a, R - 34);
    s += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="3.8" fill="${ink}"/>
      <text x="${tx.toFixed(1)}" y="${(ty + 6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${ink}">${pc}</text>`;
  });

  return s;
}

/** Small WBS Cartouche logo on the meter face */
export function renderWbsM405FaceLogo(cx: number, cy: number, ink: string): string {
  return `<g transform="translate(${(cx - 30).toFixed(1)}, ${(cy + 36).toFixed(1)})">
      <!-- Small WBS Cartouche -->
      <rect x="0" y="0" width="60" height="20" rx="4" fill="none" stroke="${ink}" stroke-width="1.5" opacity="0.85" />
      <text x="30" y="14" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
            font-size="12" font-weight="800" fill="${ink}" letter-spacing="2" opacity="0.9">WBS</text>
    </g>`;
}

/** Orange R244 G144 B44 VU needle */
export function wbsOrangeVuNeedle(px: number, py: number, R: number): NeedleParts {
  const tipY = py - (R + 24);
  return {
    shadow: `
      <path d="
        M ${px + 2} ${tipY + 2}
        L ${px + 2.6} ${tipY + 8}
        C ${px + 3.2} ${tipY + 12}, ${px + 6.4} ${tipY + 16}, ${px + 6.4} ${tipY + 20}
        C ${px + 6.4} ${tipY + 24}, ${px + 4.4} ${tipY + 28}, ${px + 3.2} ${tipY + 30}
        L ${px + 3.1} ${py + 2}
        L ${px + 0.9} ${py + 2}
        L ${px + 0.8} ${tipY + 30}
        C ${px - 0.4} ${tipY + 28}, ${px - 2.4} ${tipY + 24}, ${px - 2.4} ${tipY + 20}
        C ${px - 2.4} ${tipY + 16}, ${px + 0.8} ${tipY + 12}, ${px + 1.4} ${tipY + 8}
        Z" fill="rgba(0,0,0,0.30)"/>
    `,
    body: `
      <path d="
        M ${px} ${tipY}
        L ${px + 0.6} ${tipY + 6}
        C ${px + 1.2} ${tipY + 10}, ${px + 4.4} ${tipY + 14}, ${px + 4.4} ${tipY + 18}
        C ${px + 4.4} ${tipY + 22}, ${px + 2.4} ${tipY + 26}, ${px + 1.2} ${tipY + 28}
        L ${px + 1.1} ${py}
        L ${px - 1.1} ${py}
        L ${px - 1.2} ${tipY + 28}
        C ${px - 2.4} ${tipY + 26}, ${px - 4.4} ${tipY + 22}, ${px - 4.4} ${tipY + 18}
        C ${px - 4.4} ${tipY + 14}, ${px - 1.2} ${tipY + 10}, ${px - 0.6} ${tipY + 6}
        Z" fill="${ORANGE_NEEDLE}"/>
      <line x1="${px}" y1="${py - 5}" x2="${px}" y2="${tipY + 4}" stroke="rgba(255,255,255,0.40)" stroke-width="0.8"/>
      <circle cx="${px}" cy="${py}" r="7" fill="${ORANGE_NEEDLE}"/>
      <circle cx="${px}" cy="${py}" r="3" fill="#2d3748"/>
    `
  };
}

/** Orange R244 G144 B44 PPM needle */
export function wbsOrangePpmNeedle(px: number, py: number, R: number): NeedleParts {
  const topY = py - (R + 34);
  return {
    shadow: ppmNeedleShadow(px, py, topY),
    body: `
      <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="rgba(244, 144, 44, 0.28)" stroke-width="7.5" stroke-linecap="round"/>
      <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="${ORANGE_NEEDLE}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${px}" cy="${py}" r="7" fill="#141008"/>
      <circle cx="${px}" cy="${py}" r="3" fill="${ORANGE_NEEDLE}"/>
    `
  };
}

export const WBS_M405_STYLE: VuFaceStyle = {
  isFisam: false,
  isSifam: false,
  legend,
  vuNeedle: wbsOrangeVuNeedle,
  ppmNeedle: wbsOrangePpmNeedle,
  renderScale: renderWbsM405Scale
};
