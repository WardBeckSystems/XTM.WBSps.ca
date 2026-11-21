/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import type { DbfsView } from '../dbfs-view';
import type { MeterFrameTelemetry } from '../../types/telemetry';

/* Live levels extracted from one telemetry frame, plus the 10 s loss-of-signal tracker. */

export interface LiveLevels {
  liveL: number;
  liveR: number;
  liveSum: number;
  liveDiff: number;
  liveLufsM: number;
  liveLufsS: number;
  liveLufsI: number;
  liveLra: number;
  livePhase: number;
}

export function extractLiveLevels(levels: MeterFrameTelemetry): LiveLevels {
  const dbfs = levels.dbfs || [-60, -60, -60, -60];
  const liveL = isFinite(dbfs[0]) ? Math.max(-60, dbfs[0]) : -60;
  const liveR = isFinite(dbfs[1]) ? Math.max(-60, dbfs[1]) : -60;
  let liveSum = -60;
  let liveDiff = -60;

  if (typeof dbfs[2] === 'number' && isFinite(dbfs[2])) {
    liveSum = Math.max(-60, dbfs[2]);
  } else {
    const pL = Math.pow(10, liveL / 20);
    const pR = Math.pow(10, liveR / 20);
    const corr = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;
    const pSum = Math.sqrt(Math.max(0, pL * pL + pR * pR + 2 * pL * pR * corr)) * 0.5;
    liveSum = pSum > 1e-6 ? 20 * Math.log10(pSum) : -60;
  }

  if (typeof dbfs[3] === 'number' && isFinite(dbfs[3])) {
    liveDiff = Math.max(-60, dbfs[3]);
  } else {
    const pL = Math.pow(10, liveL / 20);
    const pR = Math.pow(10, liveR / 20);
    const corr = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;
    const pDiff = Math.sqrt(Math.max(0, pL * pL + pR * pR - 2 * pL * pR * corr)) * 0.5;
    liveDiff = pDiff > 1e-6 ? 20 * Math.log10(pDiff) : -60;
  }

  const lufsObj = levels.lufs || {};
  const liveLufsM = isFinite(lufsObj.m) ? Math.max(-60, lufsObj.m) : -60;
  const liveLufsS = isFinite(lufsObj.s) ? Math.max(-60, lufsObj.s) : -60;
  const liveLufsI = (typeof lufsObj.i === 'number' && isFinite(lufsObj.i) && lufsObj.i > -60) ? lufsObj.i : -60;
  const liveLra = (typeof lufsObj.lra === 'number' && isFinite(lufsObj.lra)) ? lufsObj.lra : 0;
  const livePhase = (levels && typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation : 1.0;

  return { liveL, liveR, liveSum, liveDiff, liveLufsM, liveLufsS, liveLufsI, liveLra, livePhase };
}

/** Track signal presence for the 10-second loss of signal warning. */
export function trackSignal(v: DbfsView, levels: MeterFrameTelemetry, live: LiveLevels, now: number): void {
  const hasSignal = levels && (
    levels.hasAudio ||
    live.liveL > -58 || live.liveR > -58 || live.liveSum > -55
  );
  if (hasSignal) {
    v.lastAudioTime = now;
    v.hasSignalLost = false;
  } else if (!v.lastAudioTime) {
    v.lastAudioTime = now;
  } else if (now - v.lastAudioTime >= 10000) {
    v.hasSignalLost = true;
  }
}
