/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import { pyrPush } from './pyramid';

/* Rolling circular history buffers: allocation, clearing and the throttled sample push. */

/** (Re)allocate every history ring buffer at size n (levels at -60, phase at +1). */
export function allocHistories(v: DbfsView, n: number): void {
  v.histL = new Float32Array(n).fill(-60);
  v.histR = new Float32Array(n).fill(-60);
  v.histSum = new Float32Array(n).fill(-60);
  v.histDiff = new Float32Array(n).fill(-60);
  v.histNormL = new Float32Array(n).fill(-60);
  v.histNormR = new Float32Array(n).fill(-60);
  v.histNormSum = new Float32Array(n).fill(-60);
  v.histNormDiff = new Float32Array(n).fill(-60);
  v.histLufsM = new Float32Array(n).fill(-60);
  v.histLufsS = new Float32Array(n).fill(-60);
  v.histLufsI = new Float32Array(n).fill(-60);
  v.histPhase = new Float32Array(n).fill(1.0);
}

export function resizeBuffer(v: DbfsView, newSize: number): void {
  if (v.bufferSize === newSize) return;
  v.bufferSize = newSize;
  allocHistories(v, newSize);
  v.head = 0;
  v.count = 0;
  v.lastPushTime = 0;
  v.pushAccumulator = 0;
  v.graphDirty = true;
}

export function clearHistory(v: DbfsView): void {
  v.head = 0;
  v.count = 0;
  v.lastPushTime = 0;
  v.pushAccumulator = 0;
  v.histL.fill(-60);
  v.histR.fill(-60);
  v.histSum.fill(-60);
  v.histDiff.fill(-60);
  v.histNormL.fill(-60);
  v.histNormR.fill(-60);
  v.histNormSum.fill(-60);
  v.histNormDiff.fill(-60);
  v.histLufsM.fill(-60);
  v.histLufsS.fill(-60);
  v.histLufsI.fill(-60);
  v.envL = -60;
  v.envR = -60;
  v.envSum = -60;
  v.envDiff = -60;
  v.envLufsM = -60;
  v.envLufsS = -60;
  v.normL = -60;
  v.normR = -60;
  v.normSum = -60;
  v.normDiff = -60;
  v.peakMaxL = -60;
  v.peakMaxR = -60;
  v.lufsMaxM = -60;
  v.clipCountL = 0;
  v.clipCountR = 0;
  v.graphDirty = true;
}

export function pushSample(v: DbfsView, dbL: number, dbR: number, lufsM: number, lufsS: number, phase: number, dbSum: number, dbDiff: number, lufsI: number): void {
  const now = performance.now();
  if (!v.lastPushTime) {
    v.lastPushTime = now;
    v.pushAccumulator = 0;
  }
  const dt = Math.max(0.0005, Math.min(0.25, (now - v.lastPushTime) / 1000));
  v.lastPushTime = now;
  v.pushAccumulator = (v.pushAccumulator || 0) + dt;

  const sampleDt = 1 / v.captureSpeed;
  const steps = Math.floor(v.pushAccumulator / sampleDt);
  if (steps <= 0) return;
  v.pushAccumulator -= steps * sampleDt;
  if (v.pushAccumulator > sampleDt * 24) v.pushAccumulator = 0;
  const runSteps = Math.min(steps, 24);

  const vL = isFinite(dbL) ? Math.max(-60, Math.min(0, dbL)) : -60;
  const vR = isFinite(dbR) ? Math.max(-60, Math.min(0, dbR)) : -60;
  const vSum = isFinite(dbSum) ? Math.max(-60, Math.min(6.02, dbSum)) : -60;
  const vDiff = isFinite(dbDiff) ? Math.max(-60, Math.min(6.02, dbDiff)) : -60;
  const vM = isFinite(lufsM) ? Math.max(-60, Math.min(0, lufsM)) : -60;
  const vS = isFinite(lufsS) ? Math.max(-60, Math.min(0, lufsS)) : -60;
  const vI = isFinite(lufsI) ? Math.max(-60, Math.min(0, lufsI)) : -60;
  const vP = isFinite(phase) ? Math.max(-1, Math.min(1, phase)) : 1.0;

  // Peak Envelope Follower with Instant Attack & Musical Release (~75 dB/sec):
  const decay = 75 * sampleDt;
  const alphaNorm = 1.0 - Math.exp(-sampleDt / 0.400);
  const decayM = 30 * sampleDt;
  const decayS = 10 * sampleDt;

  for (let s = 0; s < runSteps; s++) {
    v.envL = (vL >= v.envL) ? vL : Math.max(-60, v.envL - decay);
    v.envR = (vR >= v.envR) ? vR : Math.max(-60, v.envR - decay);
    v.envSum = (vSum >= v.envSum) ? vSum : Math.max(-60, v.envSum - decay);
    v.envDiff = (vDiff >= v.envDiff) ? vDiff : Math.max(-60, v.envDiff - decay);

    // Time-Normalized Streams (Matching the 400ms ITU-R BS.1770 M Loudness window):
    v.normL += alphaNorm * (v.envL - v.normL);
    v.normR += alphaNorm * (v.envR - v.normR);
    v.normSum += alphaNorm * (v.envSum - v.normSum);
    v.normDiff += alphaNorm * (v.envDiff - v.normDiff);

    // Loudness Envelope Follower
    v.envLufsM = (v.envLufsM === undefined || v.count === 0) ? vM : ((vM >= v.envLufsM) ? vM : Math.max(-60, v.envLufsM - decayM));
    v.envLufsS = (v.envLufsS === undefined || v.count === 0) ? vS : ((vS >= v.envLufsS) ? vS : Math.max(-60, v.envLufsS - decayS));

    v.histL[v.head] = v.envL;
    v.histR[v.head] = v.envR;
    v.histSum[v.head] = v.envSum;
    v.histDiff[v.head] = v.envDiff;
    v.histNormL[v.head] = v.normL;
    v.histNormR[v.head] = v.normR;
    v.histNormSum[v.head] = v.normSum;
    v.histNormDiff[v.head] = v.normDiff;
    v.histLufsM[v.head] = v.envLufsM;
    v.histLufsS[v.head] = v.envLufsS;
    v.histLufsI[v.head] = vI;
    v.histPhase[v.head] = vP;

    pyrPush(v);

    v.head = (v.head + 1) % v.bufferSize;
    if (v.count < v.bufferSize) v.count++;
  }

  if (vL >= 0) v.clipCountL++;
  if (vR >= 0) v.clipCountR++;

  if (vL > v.peakMaxL) v.peakMaxL = vL;
  if (vR > v.peakMaxR) v.peakMaxR = vR;
  if (vM > v.lufsMaxM) v.lufsMaxM = vM;
}
