/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * JavaScript fallback metering path (used when the WASM DSP is unavailable):
 * VU, PPM, dBFS peak, RMS, K-weighted loudness and phase correlation per block.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { VU_K_AVG, vuDbOf, vuStep } from './ballistics/vu';
import { ppmDbToFrac, ppmEnvToDb, ppmStep } from './ballistics/ppm';
import { phaseAccumulate, phaseCorrelationOf, phaseLedOf } from './phase-correlation';
import { kHighPassStep, kShelfStep } from './k-weighting';
import { integrateMomentaryShort, integratedLufs, loudnessRange, pushShortTerm, toLufs } from './loudness';
import { referenceCalGain } from './reference';

const peakDbfs = (m: number): number => m > 1e-6 ? 20 * Math.log10(m) : -120;
const rmsDbOf = (sumSq: number, len: number): number => sumSq > 0 ? Math.max(-60, 10 * Math.log10(sumSq / len)) : -60;

export function processJsBlock(engine: XtmAudioEngine, inputL: Float32Array, inputR: Float32Array): void {
  const len = inputL.length;
  const calGain = referenceCalGain(engine);
  const kAvg = VU_K_AVG;

  const vuA = engine.vuState[0], vuB = engine.vuState[1];
  const ppmA = engine.ppmState[0], ppmB = engine.ppmState[1];
  const s1L = engine.lufsState.stage1[0], s1R = engine.lufsState.stage1[1];
  const s2L = engine.lufsState.stage2[0], s2R = engine.lufsState.stage2[1];

  let hasSignal = false;
  let peakA = false, peakB = false;
  let maxA = 0, maxB = 0, maxSum = 0, maxDiff = 0;
  let sumSqK_L = 0, sumSqK_R = 0;
  let sumSqRaw_L = 0, sumSqRaw_R = 0;

  // Ballistics integration loops: VU COMPUTED FIRST FOR IMMEDIATE RESPONSE
  for (let i = 0; i < len; i++) {
    const sA = inputL[i] * calGain;
    const sB = inputR[i] * calGain;

    const rA = Math.abs(sA);
    const rB = Math.abs(sB);

    // 1. VU BALLISTICS (CALCULATED FIRST BEFORE ALL OTHER MATH)
    vuStep(engine, vuA, rA * kAvg);
    vuStep(engine, vuB, rB * kAvg);

    // Peak detection & signal presence (True L+R mathematical sum, can peak up to +6.02 dBFS)
    const rawA = Math.abs(inputL[i]);
    const rawB = Math.abs(inputR[i]);
    const rawSum = Math.abs(inputL[i] + inputR[i]); // True L + R Sum (reaches +6.02 dBFS for 0 dBFS in-phase mono)
    const rawDiff = Math.abs(inputL[i] - inputR[i]); // True L + (-R) difference / side
    if (rawA > maxA) maxA = rawA;
    if (rawB > maxB) maxB = rawB;
    if (rawSum > maxSum) maxSum = rawSum;
    if (rawDiff > maxDiff) maxDiff = rawDiff;

    sumSqRaw_L += inputL[i] * inputL[i];
    sumSqRaw_R += inputR[i] * inputR[i];

    if (rA > 0.0001 || rB > 0.0001) hasSignal = true;

    // K-weighting: shelf then RLB high pass
    const y2L = kHighPassStep(engine, s2L, kShelfStep(engine, s1L, inputL[i]));
    const y2R = kHighPassStep(engine, s2R, kShelfStep(engine, s1R, inputR[i]));
    sumSqK_L += y2L * y2L;
    sumSqK_R += y2R * y2R;

    // 2. PPM Peak Ballistics (IEC 60268-10 Quasi-Peak)
    ppmStep(engine, ppmA, rA);
    ppmStep(engine, ppmB, rB);

    // Check Peak Overload (+10 dB above reference)
    if (rA >= 1.0) peakA = true;
    if (rB >= 1.0) peakB = true;

    // 3. Stereo Phase Correlation (Pearson product-moment)
    phaseAccumulate(engine.phaseState, engine.phaseAlpha, sA, sB);
  }

  // Convert PPM envelopes to dB and fraction (-12 to +12 scale)
  const trim = engine.peakSensTrim || 0;
  const ppmDbA = ppmEnvToDb(ppmA.env, trim);
  const ppmDbB = ppmEnvToDb(ppmB.env, trim);

  const corr = phaseCorrelationOf(engine.phaseState, hasSignal);
  engine.phaseState.correlation = corr;
  const pLed = phaseLedOf(corr, hasSignal);
  engine.phaseState.led = pLed;

  // ITU-R BS.1770 / EBU R128 Loudness Integration
  const st = engine.lufsState;
  integrateMomentaryShort(engine, sumSqK_L / len, sumSqK_R / len, hasSignal);

  const lufsM = toLufs(st.meanSquareM_L + st.meanSquareM_R);
  const lufsS = toLufs(st.meanSquareS_L + st.meanSquareS_R);
  const lufsI = integratedLufs(st);
  const lufsML = toLufs(st.meanSquareM_L);
  const lufsMR = toLufs(st.meanSquareM_R);

  pushShortTerm(st, lufsS);
  const lra = loudnessRange(st);

  // Update published levels
  engine.currentLevels = {
    vu: [vuA.p, vuB.p],
    ppm: [ppmDbToFrac(ppmDbA), ppmDbToFrac(ppmDbB)],
    vuDb: [vuDbOf(vuA.p), vuDbOf(vuB.p)],
    ppmDb: [ppmDbA, ppmDbB],
    dbfs: [peakDbfs(maxA), peakDbfs(maxB), peakDbfs(maxSum), peakDbfs(maxDiff)],
    lufs: {
      m: lufsM,
      s: lufsS,
      i: lufsI,
      lra: lra,
      mL: lufsML,
      mR: lufsMR
    },
    rmsDb: [rmsDbOf(sumSqRaw_L, len), rmsDbOf(sumSqRaw_R, len)],
    phaseCorrelation: corr,
    phaseLed: pLed,
    peak: [peakA, peakB],
    hasAudio: hasSignal
  };
}
