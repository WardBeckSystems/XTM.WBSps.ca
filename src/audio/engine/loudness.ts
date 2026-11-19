/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * ITU-R BS.1770 / EBU R128 loudness: momentary (400 ms), short-term (3 s),
 * gated integrated loudness and loudness range (LRA).
 */

import type { XtmAudioEngine } from '../audio-engine';
import type { LufsState } from './types';

/** Absolute gate: > -70 LUFS */
export const LUFS_ABSOLUTE_GATE_Z = 1.25e-7;

/** Loudness Time Constants: M (400ms), S (3000ms) for bufferSize=1024 */
export function computeLufsTimeConstants(engine: XtmAudioEngine, fs: number): void {
  const blockTimeSec = 1024 / fs;
  engine.lufsAlphaM = 1.0 - Math.exp(-blockTimeSec / 0.400);
  engine.lufsAlphaS = 1.0 - Math.exp(-blockTimeSec / 3.000);
}

/** Mean-square energy to LUFS, floored at -60. */
export function toLufs(z: number): number {
  return z > 1e-12 ? Math.max(-60, -0.691 + 10 * Math.log10(z)) : -60;
}

/** Add one block's energy to the integrated accumulator. */
export function accumulateIntegrated(st: LufsState, blockTotalZ: number): void {
  st.sumEnergy += blockTotalZ;
  st.blockCount++;
}

/** Gated integrated loudness; -Infinity before any gated block. */
export function integratedLufs(st: LufsState): number {
  const zI = st.blockCount > 0 ? (st.sumEnergy / st.blockCount) : 0;
  return zI > 0 ? toLufs(zI) : -Infinity;
}

/** Track a short-term reading for LRA (rolling 200-entry history). */
export function pushShortTerm(st: LufsState, lufsS: number): void {
  if (lufsS > -60) {
    st.shortTermHist.push(lufsS);
    if (st.shortTermHist.length > 200) {
      st.shortTermHist.shift();
    }
  }
}

/** Loudness Range (p95 - p10) once 10 readings exist, else 0. */
export function loudnessRange(st: LufsState): number {
  if (st.shortTermHist.length >= 10) {
    const sorted = [...st.shortTermHist].sort((a, b) => a - b);
    const p10 = sorted[Math.floor(sorted.length * 0.10)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    return Math.max(0, p95 - p10);
  }
  return 0;
}

/** Advance M/S mean-square integrators (JS path). */
export function integrateMomentaryShort(engine: XtmAudioEngine, zBlockL: number, zBlockR: number, hasSignal: boolean): void {
  const st = engine.lufsState;
  if (hasSignal) {
    st.meanSquareM_L += engine.lufsAlphaM * (zBlockL - st.meanSquareM_L);
    st.meanSquareM_R += engine.lufsAlphaM * (zBlockR - st.meanSquareM_R);

    st.meanSquareS_L += engine.lufsAlphaS * (zBlockL - st.meanSquareS_L);
    st.meanSquareS_R += engine.lufsAlphaS * (zBlockR - st.meanSquareS_R);

    const blockTotalZ = zBlockL + zBlockR;
    if (blockTotalZ > LUFS_ABSOLUTE_GATE_Z) { // > -70 LUFS threshold gate
      accumulateIntegrated(st, blockTotalZ);
    }
  } else {
    st.meanSquareM_L *= 0.92;
    st.meanSquareM_R *= 0.92;
    st.meanSquareS_L *= 0.97;
    st.meanSquareS_R *= 0.97;
  }
}

/** Clear the JS-side M/S/I/LRA accumulators (K-filter state is kept). */
export function clearLufsAccumulators(st: LufsState): void {
  st.meanSquareM_L = 0;
  st.meanSquareM_R = 0;
  st.meanSquareS_L = 0;
  st.meanSquareS_R = 0;
  st.sumEnergy = 0;
  st.blockCount = 0;
  st.shortTermHist = [];
}

/**
 * Reset BS.1770 integrated loudness and LRA accumulators
 */
export function resetLoudness(engine: XtmAudioEngine): void {
  clearLufsAccumulators(engine.lufsState);
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.resetLoudness();
  }
}
