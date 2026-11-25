/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/** Per-second telemetry log and fast-transient event log, recorded from the frame loop. */

import { buildTelemetryEntry, buildTransientEntry } from './telemetry-entry';

export interface TelemetryRecorder {
  telemetryLog: any[];
  transientLog: any[];
  recordTelemetry(levels: any, now: number): void;
  recordTransientEvent(levels: any): void;
}

export { buildTelemetryEntry, buildTransientEntry } from './telemetry-entry';

export function createTelemetryRecorder(): TelemetryRecorder {
  const telemetryLog: any[] = [];
  const maxTelemetryEntries = 7200; // 2 hours of 1-second records
  let lastLogSec = 0;

  function recordTelemetry(levels: any, now: number) {
    if (now - lastLogSec < 1000) return;
    lastLogSec = now;
    telemetryLog.push(buildTelemetryEntry(levels));
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
      transientLog.push(buildTransientEntry(levels, curA, curB, curSum, curDiff, deltaA, deltaB));
      if (transientLog.length > maxTransientEntries) transientLog.shift();
    }
  }

  return { telemetryLog, transientLog, recordTelemetry, recordTransientEvent };
}
