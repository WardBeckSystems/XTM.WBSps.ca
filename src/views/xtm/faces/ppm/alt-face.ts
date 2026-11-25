/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Shared renderer for the classic PPM faces (non-default standards, WBS mode).
 * The needle mapping is the same for all (-12 .. +12 dB about the alignment tone);
 * only the engraving differs, described by an AltPpmFace table.
 */
import type { PolarFn, ArcFn } from '../../lib/svg';
import { R } from '../../layout/wbs-layout';
import { ppmAngle } from '../../lib/scale-math';
import { tickLine } from '../../lib/svg';

export interface AltPpmFace {
  /** engraved value of the alignment tone (engraved = dB about tone + offset) */
  offset: number;
  majors: number[];
  minors: number[];
  /** engraved value from which ticks and band are red */
  redFrom: number;
  caption: string;
  fmt: (L: number) => string;
}

const RED = '#ef4444';

export function renderAltPpmFace(f: AltPpmFace, P: PolarFn, arc: ArcFn, ink: string, isFisam: boolean): string {
  const q = (d: number) => ppmAngle((d + 12) / 24, isFisam);
  const red = RED;
  const dOf = (L: number) => L - f.offset;           // engraved value -> dB about tone
  let s = arc(q(dOf(f.redFrom)), q(12), R + 8, 16, red);
  for (const L of f.minors) {
    const d = dOf(L); if (d < -12 || d > 12) continue;
    s += tickLine(P, q(d), R, R + 14, L >= f.redFrom ? red : ink, 4);
  }
  for (const L of f.majors) {
    const d = dOf(L); if (d < -12 || d > 12) continue;
    const col = L >= f.redFrom ? red : ink;
    s += tickLine(P, q(d), R, R + 24, col, 4);
    const [tx, ty] = P(q(d), R + 48);
    s += `<text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="${f.fmt(L).length > 3 ? 22 : 26}" font-weight="700" text-anchor="middle" fill="${col}">${f.fmt(L)}</text>`;
  }
  const [cx0, cy0] = P(0, R - 70);
  s += `<text x="${cx0.toFixed(1)}" y="${cy0.toFixed(1)}" font-size="18" font-weight="800" letter-spacing="2" text-anchor="middle" fill="${ink}" opacity="0.8">${f.caption}</text>`;
  return s;
}
