/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems M433/M434 Peak Program Meter (DA91001/SCALE2-3, p. 3-2):
 * - Fig. 1-2 METER SCALE 2: Reference -8 with 0 to +6 yellow marker
 * - Fig. 1-3 METER SCALE 3: Reference -8 (clean unhighlighted scale)
 *
 * Spanning -20 to +4 dB (major divisions every 4 dB, intermediate ticks every 2 dB).
 * In Scale 2, the yellow overload warning marker runs from 0 to +6 dB.
 * All scale and calibration math is centralized in src/views/xtm/lib/scale-math.ts.
 */
import type { FaceCtx } from '../face-types';
import { R } from '../../layout/wbs-layout';
import {
  WBS_M433_MAJOR_TICKS,
  WBS_M433_MINOR_TICKS,
  WBS_M433_REF_DB,
  WBS_M433_WARN_START_DB,
  WBS_M433_WARN_END_DB,
  wbsPpmDialAngle,
  wbsPpmDialDbToFrac,
  ppmAngle
} from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';

const WARN = '#facc15'; // Authentic yellow warning marker

/**
 * Fig. 1-2 METER SCALE 2:
 * Reference -8 with 0 to +6 yellow marker, 'R' and 'dB' legends under -8.
 */
export function renderWbsScale2Face(ctx: FaceCtx, isBlackPpm: boolean): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  let s = '';

  // 1. Arc extension from +4 dB to +6 dB
  s += arc(ppmAngle(1, isFisam), wbsPpmDialAngle(WBS_M433_WARN_END_DB, isFisam), R, 4, ink);

  // 2. Yellow warning marker band from 0 dB to +6 dB
  const a0 = wbsPpmDialAngle(WBS_M433_WARN_START_DB, isFisam);
  const a6 = wbsPpmDialAngle(WBS_M433_WARN_END_DB, isFisam);
  s += arc(a0, a6, R + 8, 16, WARN);

  // 3. Intermediate ticks (every 2 dB)
  WBS_M433_MINOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    if (d === 2) {
      // Inside yellow band: black tick inside band for high contrast
      s += tickLine(P, a, R, R + 14, isBlackPpm ? '#141517' : ink, 2.8);
    } else {
      s += tickLine(P, a, R, R + 14, ink, 2.8);
    }
  });

  // 4. Major ticks
  WBS_M433_MAJOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    if (d === WBS_M433_REF_DB) {
      // Elongated Reference tick pointing down towards 'R' and 'dB'
      s += tickLine(P, a, R - 14, R + 24, ink, 4);
    } else if (d === 0 || d === 4) {
      // Inside yellow band
      s += tickLine(P, a, R, R + 16, isBlackPpm ? '#141517' : ink, 4);
      s += tickLine(P, a, R + 16, R + 24, isBlackPpm ? WARN : ink, 4);
    } else {
      s += tickLine(P, a, R, R + 24, ink, 4);
    }
  });

  // +6 dB End tick
  s += tickLine(P, a6, R, R + 16, isBlackPpm ? '#141517' : ink, 4);
  s += tickLine(P, a6, R + 16, R + 20, isBlackPpm ? WARN : ink, 4);

  // 5. Major Numerals: -20, -16, -12, -8, -4, 0, +4
  WBS_M433_MAJOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    const [tx, ty] = P(a, R + 48);
    const col = (d >= 0 && isBlackPpm) ? WARN : ink;
    const lbl = d > 0 ? '+' + d : String(d);
    s += `<text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${lbl}</text>`;
  });

  // 6. 'R' (Reference) and 'dB' legends below tick -8
  const [rx, ry] = P(0, R - 34);
  s += `<text x="${rx.toFixed(1)}" y="${(ry + 8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="${ink}">R</text>`;
  const [dbx, dby] = P(0, R - 60);
  s += `<text x="${dbx.toFixed(1)}" y="${(dby + 8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${ink}">dB</text>`;

  return s;
}

/**
 * Fig. 1-3 METER SCALE 3:
 * Reference -8, clean unhighlighted scale, 'dB' legend under -8.
 */
export function renderWbsScale3Face(ctx: FaceCtx): string {
  const { P, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  let s = '';

  // 1. Intermediate ticks (every 2 dB)
  WBS_M433_MINOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    s += tickLine(P, a, R, R + 14, ink, 2.8);
  });

  // 2. Major ticks
  WBS_M433_MAJOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    if (d === WBS_M433_REF_DB) {
      // Elongated Reference tick pointing down towards 'dB'
      s += tickLine(P, a, R - 20, R + 24, ink, 4);
    } else {
      s += tickLine(P, a, R, R + 24, ink, 4);
    }
  });

  // 3. Major Numerals: -20, -16, -12, -8, -4, 0, +4
  WBS_M433_MAJOR_TICKS.forEach(d => {
    const a = wbsPpmDialAngle(d, isFisam);
    const [tx, ty] = P(a, R + 48);
    const lbl = d > 0 ? '+' + d : String(d);
    s += `<text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle" fill="${ink}">${lbl}</text>`;
  });

  // 4. 'dB' legend below tick -8
  const [dbx, dby] = P(0, R - 44);
  s += `<text x="${dbx.toFixed(1)}" y="${(dby + 8).toFixed(1)}" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="${ink}">dB</text>`;

  return s;
}

/** Default WBS PPM face (Scale 2) */
export function renderWbsType2Face(ctx: FaceCtx, isBlackPpm: boolean): string {
  return renderWbsScale2Face(ctx, isBlackPpm);
}
