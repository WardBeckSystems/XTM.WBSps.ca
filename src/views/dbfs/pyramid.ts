/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';

/* ---------------- Anti-shimmer pyramid (mip-mapped history) ----------------
   Level l holds, for each fixed 2^l-sample block anchored to the ABSOLUTE sample index,
   both the block max and the block sum (-> mean). Drawing samples it like a trilinear
   texture: interpolated between neighbouring blocks AND between neighbouring levels, so
   nothing snaps when a block edge or a level change passes a pixel column. */

export const PYR_LEVELS = 14;           // up to 16384-sample blocks

export function pyrSources(v: DbfsView): Float32Array[] {
  return [v.histL, v.histR, v.histSum, v.histDiff,
          v.histNormL, v.histNormR, v.histNormSum, v.histNormDiff,
          v.histLufsM, v.histLufsS, v.histLufsI, v.histPhase];
}

export function pyrReset(v: DbfsView): void {
  v.pyr = new Map();
  const n = v.bufferSize;
  for (const src of pyrSources(v)) {
    const max: Float32Array[] = [new Float32Array(0)];
    const sum: Float32Array[] = [new Float32Array(0)];
    for (let l = 1; l <= PYR_LEVELS; l++) {
      max.push(new Float32Array((n >> l) + 2).fill(-60));
      sum.push(new Float32Array((n >> l) + 2).fill(0));
    }
    v.pyr.set(src, { max, sum });
  }
  v.pyrFor = v.histL;
  v.absCount = 0;
}

/** Fold the sample just written at v.head into every block level. */
export function pyrPush(v: DbfsView): void {
  if (v.count === 0 || v.pyrFor !== v.histL) pyrReset(v);
  const A = v.absCount;
  const h = v.head;
  for (const [src, lv] of v.pyr) {
    const val = src[h]!;
    for (let l = 1; l <= PYR_LEVELS; l++) {
      const mx = lv.max[l]!, sm = lv.sum[l]!;
      const slot = Math.floor(A / (1 << l)) % mx.length;
      if ((A & ((1 << l) - 1)) === 0) { mx[slot] = val; sm[slot] = val; }
      else { if (val > mx[slot]!) mx[slot] = val; sm[slot] = sm[slot]! + val; }
    }
  }
  v.absCount = A + 1;
}

/** Raw sample at absolute index a (linear interpolation, clamped to the buffer). */
export function rawAt(v: DbfsView, hist: Float32Array, a: number): number {
  const oldest = v.absCount - v.count, newest = v.absCount - 1;
  const ac = Math.max(oldest, Math.min(newest, a));
  const a0 = Math.floor(ac), a1 = Math.min(newest, a0 + 1), t = ac - a0;
  const n = v.bufferSize;
  const i0 = ((v.head - (v.absCount - a0)) % n + n) % n;
  const i1 = ((v.head - (v.absCount - a1)) % n + n) % n;
  return hist[i0]! * (1 - t) + hist[i1]! * t;
}

/** Block value (max or mean) at level l, block index b, clamped to valid blocks. */
export function blockAt(v: DbfsView, hist: Float32Array, l: number, b: number, useMean: boolean): number {
  const lv = v.pyr.get(hist)!;
  const B = 1 << l;
  const bOld = Math.ceil((v.absCount - v.count) / B), bNew = Math.floor((v.absCount - 1) / B);
  const bc = Math.max(bOld, Math.min(bNew, b));
  const slot = bc % lv.max[l]!.length;
  if (!useMean) return lv.max[l]![slot]!;
  const filled = Math.min(B, v.absCount - bc * B); // newest block may be partial
  return lv.sum[l]![slot]! / Math.max(1, filled);
}

/** Level l sampled continuously at absolute position a (interpolated between block centres). */
export function levelAt(v: DbfsView, hist: Float32Array, l: number, a: number, useMean: boolean): number {
  if (l <= 0) return rawAt(v, hist, a);
  const B = 1 << l;
  const bf = a / B - 0.5;
  const b0 = Math.floor(bf), t = bf - b0;
  return blockAt(v, hist, l, b0, useMean) * (1 - t) + blockAt(v, hist, l, b0 + 1, useMean) * t;
}

/**
 * Trilinear sample: level f = log2(samples per pixel) + extra blur, blended between the two
 * nearest levels. pos = 0 (newest, right) .. 1 (oldest, left). Past ~50% the value fades
 * from peak-hold (max) to the block mean and is progressively blurred, so the squeezed
 * history smooths out instead of moiré-ing.
 */
export function pyrSample(v: DbfsView, hist: Float32Array, a: number, samplesPerPx: number, pos: number, meanOnly = false): number {
  const sstep = (e0: number, e1: number, x: number) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const blur = 2.5 * sstep(0.5, 1.0, pos);                 // up to ~2.5 extra octaves of smoothing at the far left
  const f = Math.max(0, Math.min(PYR_LEVELS - 1, Math.log2(Math.max(1, samplesPerPx)) + blur));
  const l0 = Math.floor(f), t = f - l0;
  const sample = (useMean: boolean) =>
    levelAt(v, hist, l0, a, useMean) * (1 - t) + levelAt(v, hist, l0 + 1, a, useMean) * t;
  const wMean = meanOnly ? 1 : sstep(0.35, 0.6, pos);      // peak-hold right of centre, mean past 50%
  const vMax = wMean < 1 ? sample(false) : 0;
  const vMean = wMean > 0 ? sample(true) : 0;
  return vMax * (1 - wMean) + vMean * wMean;
}
