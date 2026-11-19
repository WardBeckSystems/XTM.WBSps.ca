/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Per-second telemetry log and fast-transient event log, recorded from the frame loop. */

export interface TelemetryRecorder {
  telemetryLog: any[];
  transientLog: any[];
  recordTelemetry(levels: any, now: number): void;
  recordTransientEvent(levels: any): void;
}

export function createTelemetryRecorder(): TelemetryRecorder {
  const telemetryLog: any[] = [];
  const maxTelemetryEntries = 7200; // 2 hours of 1-second records
  let lastLogSec = 0;

  function recordTelemetry(levels: any, now: number) {
    if (now - lastLogSec < 1000) return;
    lastLogSec = now;
    const dbfs = levels.dbfs || [-60, -60, -60, -60];
    const lufs = levels.lufs || {};
    telemetryLog.push({
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
    });
    if (telemetryLog.length > maxTelemetryEntries) telemetryLog.shift();
  }

  // Super High Transient Event Logger
  const transientLog: any[] = [];
  const maxTransientEntries = 5000;
  let prevDbfsA = -60, prevDbfsB = -60;

  function recordTransientEvent(levels: any) {
    if (!levels || !levels.hasAudio) return;
    const dbfs = levels.dbfs || [-60, -60, -60, -60];
    const curA = dbfs[0];
    const curB = dbfs[1];
    const curSum = typeof dbfs[2] === 'number' ? dbfs[2] : Math.max(curA, curB);
    const curDiff = typeof dbfs[3] === 'number' ? dbfs[3] : -60;
    const deltaA = curA - prevDbfsA;
    const deltaB = curB - prevDbfsB;
    prevDbfsA = curA;
    prevDbfsB = curB;

    // Fast transient trigger: sharp transient spike (delta >= 3.5 dB), high peak (>= -9 dBFS), or clipping
    if (deltaA >= 3.5 || deltaB >= 3.5 || curA >= -9.0 || curB >= -9.0) {
      transientLog.push({
        time: new Date().toISOString(),
        chA: curA.toFixed(2),
        chB: curB.toFixed(2),
        sum: curSum.toFixed(2),
        diff: curDiff.toFixed(2),
        deltaA: deltaA.toFixed(2),
        deltaB: deltaB.toFixed(2),
        lufsM: (levels.lufs && isFinite(levels.lufs.m)) ? levels.lufs.m.toFixed(2) : '-60.00'
      });
      if (transientLog.length > maxTransientEntries) transientLog.shift();
    }
  }

  return { telemetryLog, transientLog, recordTelemetry, recordTransientEvent };
}
