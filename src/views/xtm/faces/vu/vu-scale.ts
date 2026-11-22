/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * VU scale engraving shared by every VU style: -20..0 black arc, 0..+3 red band,
 * intermediate and major ticks with numerals, percentage sub-scale.
 */
import type { FaceCtx } from '../face-types';
import { R } from '../../layout/wbs-layout';
import { vuAngle, vuFrac } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';

export const VU_RED = '#dc2626';

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

export function renderVuScale(ctx: FaceCtx): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  const redBandCol = VU_RED;
  let s = '';

  // VU Scale Arcs: -20 to 0 VU black, 0 to +3 VU red
  s += arc(vuAngle(vuFrac(-20), isFisam), vuAngle(vuFrac(0), isFisam), R, 3.8, ink);
  s += arc(vuAngle(vuFrac(0), isFisam), vuAngle(vuFrac(3), isFisam), R + 3, 10, redBandCol);

  // Intermediate ticks
  INTERMEDIATE_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const tickLen = Math.abs(d) <= 3 ? 12 : 14;
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + tickLen, col, Math.abs(d) <= 3 ? '2.5' : '3');
  });

  // Major ticks + numerals
  MAJOR_TICKS.forEach(d => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [tx, ty] = P(a, R + 46);
    const col = d > 0 ? redBandCol : ink;
    s += tickLine(P, a, R, R + 24, col, '4.2') + `
              <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
  });

  // Percentage sub-scale dots & numbers (0, 20, 40, 60, 80, 100%)
  PERCENT_POINTS.forEach(({ pc, d }) => {
    const a = vuAngle(vuFrac(d), isFisam);
    const [x1, y1] = P(a, R - 8), [tx, ty] = P(a, R - 32);
    s += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.2" fill="${ink}"/>
              <text x="${tx.toFixed(1)}" y="${(ty + 6).toFixed(1)}" font-size="16" font-weight="700" text-anchor="middle" fill="${ink}">${pc}</text>`;
  });

  return s;
}
