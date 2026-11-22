/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Needle scale math: dB / level fraction to needle angle (degrees from vertical). */

export function vuFrac(db: number): number {
  return Math.pow(10, (db - 3) / 20);
}

export function vuAngle(p: number, isFisam = false): number {
  if (isFisam) {
    return -50 + 100 * Math.max(-0.03, Math.min(1.08, p));
  }
  return -45 + 90 * Math.max(-0.03, Math.min(1.08, p));
}

export function ppmFrac(db: number | null): number {
  if (db === null || !Number.isFinite(db)) return -0.12;
  return db >= -12 ? (db + 12) / 24 : -0.12 * (1 - Math.pow(10, (db + 12) / 20));
}

export function ppmAngle(q: number, isFisam = false): number {
  if (isFisam) {
    return -50 + 100 * Math.max(-0.13, Math.min(1.08, q));
  }
  return -45 + 90 * Math.max(-0.13, Math.min(1.08, q));
}

/** Needle rest angle (fully left) for the face style */
export function restAngle(isFisam: boolean): number {
  return isFisam ? -50 : -45;
}

/** Standard cubic Hermite smoothstep interpolation between e0 and e1 */
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

