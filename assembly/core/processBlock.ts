/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { MAX_BUFFER_SIZE } from "./constants";
import { inputBufferL, inputBufferR, outputTelemetry } from "./buffers";
import { sampleRate, calGain } from "./state";
import { peakToDbfs } from "./peakToDbfs";
import { vu_p_L, vu_p_R } from "../vu/state";
import { processVuSample } from "../vu/processVuSample";
import { kShelfL } from "../loudness/kweighting/kShelfL";
import { kShelfR } from "../loudness/kweighting/kShelfR";
import { kHighPassL } from "../loudness/kweighting/kHighPassL";
import { kHighPassR } from "../loudness/kweighting/kHighPassR";
import { integrateLoudness } from "../loudness/integrateLoudness";
import { powerToLufs } from "../loudness/powerToLufs";
import { msM_L, msM_R, msS_L, msS_R } from "../loudness/state";
import { ppm_env_L, ppm_env_R } from "../ppm/state";
import { processPpmSample } from "../ppm/processPpmSample";
import { ppmEnvToDb } from "../ppm/ppmEnvToDb";
import { ppmDbToFrac } from "../ppm/ppmDbToFrac";
import { phase_corr } from "../phase/state";
import { processPhaseSample } from "../phase/processPhaseSample";
import { updatePhaseCorrelation } from "../phase/updatePhaseCorrelation";

/**
 * High-speed DSP processing block executed over linear WASM memory.
 * Computes calibrated VU, PPM, True Peak, Sum/Diff, Phase & BS.1770 LUFS.
 */
export function processBlock(len: i32): void {
  if (len <= 0) return;
  const count: i32 = len > MAX_BUFFER_SIZE ? MAX_BUFFER_SIZE : len;

  let hasSignal: boolean = false;
  let maxA: f32 = 0.0;
  let maxB: f32 = 0.0;
  let maxSum: f32 = 0.0;
  let maxDiff: f32 = 0.0;

  let sumSqK_L: f64 = 0.0;
  let sumSqK_R: f64 = 0.0;

  for (let i: i32 = 0; i < count; i++) {
    const rawInL: f32 = unchecked(inputBufferL[i]);
    const rawInR: f32 = unchecked(inputBufferR[i]);

    const sA: f64 = (<f64>rawInL) * calGain;
    const sB: f64 = (<f64>rawInR) * calGain;

    const rA: f64 = Math.abs(sA);
    const rB: f64 = Math.abs(sB);

    if (rA > 0.0001 || rB > 0.0001) hasSignal = true;

    // 1. VU Ballistics
    processVuSample(rA, rB);

    // Peak & Sum/Diff tracking
    const absA: f32 = <f32>Math.abs(<f64>rawInL);
    const absB: f32 = <f32>Math.abs(<f64>rawInR);
    const absSum: f32 = <f32>Math.abs(<f64>(rawInL + rawInR));
    const absDiff: f32 = <f32>Math.abs(<f64>(rawInL - rawInR));

    if (absA > maxA) maxA = absA;
    if (absB > maxB) maxB = absB;
    if (absSum > maxSum) maxSum = absSum;
    if (absDiff > maxDiff) maxDiff = absDiff;

    // 2. K-Weighting Stage 1: High Shelf
    const y1L: f64 = kShelfL(<f64>rawInL);
    const y1R: f64 = kShelfR(<f64>rawInR);

    // 3. K-Weighting Stage 2: High Pass RLB
    const y2L: f64 = kHighPassL(y1L);
    const y2R: f64 = kHighPassR(y1R);

    sumSqK_L += y2L * y2L;
    sumSqK_R += y2R * y2R;

    // 4. PPM Peak Ballistics (IEC 60268-10 Quasi-Peak)
    processPpmSample(rA, rB);

    // 5. Stereo Phase Correlation
    processPhaseSample(sA, sB);
  }

  // Calculate Output Metrics
  updatePhaseCorrelation(hasSignal);

  // PPM dB and needle fractions (Broadcast alignment: 0 dB PPM = -18 dBFS reference level)
  const ppmDbA: f64 = ppmEnvToDb(ppm_env_L);
  const ppmDbB: f64 = ppmEnvToDb(ppm_env_R);
  const ppmFracA: f64 = ppmDbToFrac(ppmDbA);
  const ppmFracB: f64 = ppmDbToFrac(ppmDbB);

  // Digital Peak Full Scale (dBFS)
  const dbfsA: f64 = peakToDbfs(maxA);
  const dbfsB: f64 = peakToDbfs(maxB);
  const dbfsSum: f64 = peakToDbfs(maxSum);
  const dbfsDiff: f64 = peakToDbfs(maxDiff);

  // LUFS Integration (ITU-R BS.1770-4)
  const zBlockL: f64 = sumSqK_L / (<f64>count);
  const zBlockR: f64 = sumSqK_R / (<f64>count);
  const blockTotalZ: f64 = zBlockL + zBlockR;

  // Real block duration in seconds for accurate integration time constants
  const blockDt: f64 = (<f64>count) / sampleRate;
  integrateLoudness(zBlockL, zBlockR, blockDt, hasSignal);

  const lufsM: f64 = powerToLufs(msM_L + msM_R);
  const lufsS: f64 = powerToLufs(msS_L + msS_R);
  const lufsML: f64 = powerToLufs(msM_L);
  const lufsMR: f64 = powerToLufs(msM_R);

  // Write out 20 telemetry floats directly into WASM output array
  unchecked(outputTelemetry[0] = <f32>vu_p_L);
  unchecked(outputTelemetry[1] = <f32>vu_p_R);
  unchecked(outputTelemetry[2] = <f32>ppmDbA);
  unchecked(outputTelemetry[3] = <f32>ppmDbB);
  unchecked(outputTelemetry[4] = <f32>ppmFracA);
  unchecked(outputTelemetry[5] = <f32>ppmFracB);
  unchecked(outputTelemetry[6] = <f32>dbfsA);
  unchecked(outputTelemetry[7] = <f32>dbfsB);
  unchecked(outputTelemetry[8] = <f32>dbfsSum);
  unchecked(outputTelemetry[9] = <f32>dbfsDiff);
  unchecked(outputTelemetry[10] = <f32>lufsM);
  unchecked(outputTelemetry[11] = <f32>lufsS);
  unchecked(outputTelemetry[12] = <f32>phase_corr);
  unchecked(outputTelemetry[13] = hasSignal ? 1.0 : 0.0);
  unchecked(outputTelemetry[14] = maxA >= 1.0 ? 1.0 : 0.0);
  unchecked(outputTelemetry[15] = maxB >= 1.0 ? 1.0 : 0.0);
  unchecked(outputTelemetry[16] = <f32>lufsML);
  unchecked(outputTelemetry[17] = <f32>lufsMR);
  unchecked(outputTelemetry[18] = <f32>blockTotalZ);
  unchecked(outputTelemetry[19] = 0.0);
}
