/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Shared SVG helpers for dial faces: polar point, arc band, radial tick line. */

export type PolarFn = (a: number, r: number) => [number, number];
export type ArcFn = (a0: number, a1: number, r: number, w: number, col: string) => string;

/** Polar point about the pivot (px, py); angle a in degrees from vertical, radius r. */
export function makePolar(px: number, py: number): PolarFn {
  return (a: number, r: number): [number, number] => {
    const t = a * Math.PI / 180;
    return [px + r * Math.sin(t), py - r * Math.cos(t)];
  };
}

/** Arc band from angle a0 to a1 at radius r, stroke width w. */
export function makeArc(P: PolarFn): ArcFn {
  return (a0: number, a1: number, r: number, w: number, col: string): string => {
    const [x1, y1] = P(a0, r), [x2, y2] = P(a1, r);
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  };
}

/** Radial tick line at angle a from radius r1 to r2. */
export function tickLine(P: PolarFn, a: number, r1: number, r2: number, col: string, w: string | number): string {
  const [x1, y1] = P(a, r1), [x2, y2] = P(a, r2);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${w}"/>`;
}
