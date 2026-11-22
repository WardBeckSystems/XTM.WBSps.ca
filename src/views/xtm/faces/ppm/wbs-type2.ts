/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * PPM face, ppmStandard 'type2' (default) - WBS XTM4 face: -12 .. +12 dB,
 * yellow band +8 .. +12, no PPM / dB / TONE legends, no inner dBu scale.
 */
import type { FaceCtx } from '../face-types';
import { R } from '../../layout/wbs-layout';
import { ppmAngle } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';

const WARN = '#facc15'; // yellow, no red

export function renderWbsType2Face(ctx: FaceCtx, isBlackPpm: boolean): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  let s = arc(ppmAngle(18 / 24, isFisam), ppmAngle(1, isFisam), R + 8, 16, WARN);

  for (let d = -12; d <= 12; d += 2) {
    const a = ppmAngle((d + 12) / 24, isFisam);
    const tickCol = (d >= 6 && isBlackPpm) ? '#facc15' : ink;
    s += tickLine(P, a, R, R + (d % 4 ? 14 : 24), tickCol, 4);
  }

  [-12, -8, -4, 0, 4, 8, 12].forEach(d => {
    const a = ppmAngle((d + 12) / 24, isFisam);
    const [tx, ty] = P(a, R + 48);
    const col = (d >= 8 && isBlackPpm) ? '#facc15' : ink;
    s += `<text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
  });

  return s;
}
