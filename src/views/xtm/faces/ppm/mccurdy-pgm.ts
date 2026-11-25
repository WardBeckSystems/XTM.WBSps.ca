/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy ATS-100 PGM PPM face (McCurdy skin only, class mc-only):
 * outer dB-from-tone scale, inner dBu scale (TONE = +8), yellow +8 .. +12 band.
 */
import type { FaceCtx } from '../face-types';
import { R } from '../../layout/wbs-layout';
import { ppmAngle } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';

export function renderMcCurdyPgmFace(ctx: FaceCtx): string {
  const { P, arc, ink } = ctx;
  const isFisam = ctx.isFisam ?? ctx.isSifam ?? false;
  const q = (d: number) => ppmAngle((d + 12) / 24, isFisam);
  const yel = '#e3c22a';
  let m = `<g class="mc-only">`;
  m += arc(q(8), q(12), R + 9, 18, yel);
  m += arc(q(8), q(12), R + 3, 1.6, '#1a1a1a') + arc(q(8), q(12), R + 15, 1.6, '#1a1a1a');
  for (let d = -12; d <= 12; d += 2) {
    const major = d % 4 === 0;
    m += tickLine(P, q(d), major ? R - 16 : R, major ? R + 20 : R + 12, ink, major ? 4 : 3);
  }
  const lbl = (x: number, y: number, t: string, size = 24) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" font-weight="500" text-anchor="middle" dominant-baseline="central" fill="${ink}" font-family="Helvetica, Arial, sans-serif">${t}</text>`;
  [-12, -8, -4, 4, 8, 12].forEach(d => { const [x, y] = P(q(d), R + 44); m += lbl(x, y, String(Math.abs(d))); });
  const [tx, ty] = P(q(0), R + 30);
  m += lbl(tx, ty - 34, 'TONE') + lbl(tx, ty - 4, '&#8722; | +', 22);
  [-12, -8, -4, 0, 4, 8, 12].forEach(d => {
    const v = d + 8;
    const [x, y] = P(q(d), R - 42);
    m += lbl(x, y, v > 0 ? '+' + v : String(v));
  });
  const [gx, gy] = P(ppmAngle(0.9, isFisam), R + 92);
  m += lbl(gx, gy, 'PGM');
  m += `</g>`;
  return m;
}
