/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Record builders for per-second telemetry and transient log events. */

export function buildTelemetryEntry(levels: any): any {
  const dbfs = levels.dbfs || [-60, -60, -60, -60];
  const lufs = levels.lufs || {};
  return {
    time: new Date().toISOString(),
    chA: levels.hasAudio ? dbfs[0].toFixed(2) : '-60.00',
    chB: levels.hasAudio ? dbfs[1].toFixed(2) : '-60.00',
    sum: levels.hasAudio && typeof dbfs[2] === 'number' ? dbfs[2].toFixed(2) : '-60.00',
    diff: levels.hasAudio && typeof dbfs[3] === 'number' ? dbfs[3].toFixed(2) : '-60.00',
    lufsM: isFinite(lufs.m) ? lufs.m.toFixed(2) : '-60.00',
    lufsS: isFinite(lufs.s) ? lufs.s.toFixed(2) : '-60.00',
    lufsI: isFinite(lufs.i) ? lufs.i.toFixed(2) : '-60.00',
    lra: isFinite(lufs.lra) ? lufs.lra.toFixed(2) : '0.00',
    phase: (typeof levels.phaseCorrelation === 'number') ? levels.phaseCorrelation.toFixed(3) : '1.000'
  };
}

export function buildTransientEntry(
  levels: any,
  curA: number,
  curB: number,
  curSum: number,
  curDiff: number,
  deltaA: number,
  deltaB: number
): any {
  return {
    time: new Date().toISOString(),
    chA: curA.toFixed(2),
    chB: curB.toFixed(2),
    sum: curSum.toFixed(2),
    diff: curDiff.toFixed(2),
    deltaA: deltaA.toFixed(2),
    deltaB: deltaB.toFixed(2),
    lufsM: (levels.lufs && isFinite(levels.lufs.m)) ? levels.lufs.m.toFixed(2) : '-60.00'
  };
}
