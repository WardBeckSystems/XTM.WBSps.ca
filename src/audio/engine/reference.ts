/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Reference / calibration level: analog dBu (+4 dBu = 0 VU) or digital dBFS
 * (-18 dBFS = 0 VU), plus PPM SENS trim. Pushed to the WASM DSP when ready.
 */

import type { XtmAudioEngine } from '../audio-engine';

/**
 * Set calibration reference level in dBu (+4 dBu default, -60 to +30),
 * or in dBFS when isDigital is true.
 */
export function setReferenceLevel(engine: XtmAudioEngine, levelDb: number, isDigital: boolean = false): void {
  engine.refLevelDb = levelDb;
  engine.isRefDigital = isDigital;
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.setRefLevel(levelDb, isDigital);
  }
}

export function setPeakSensTrim(engine: XtmAudioEngine, db: number): void {
  engine.peakSensTrim = db;
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.setPeakTrim(db);
  }
}

/**
 * Reference Scaling:
 * Standard broadcast alignment: 0 VU = +4 dBu (-18 dBFS).
 * Calibration scales with refLevelDb.
 */
export function referenceCalGain(engine: XtmAudioEngine): number {
  return engine.isRefDigital
    ? Math.pow(10, (-18 - engine.refLevelDb) / 20)
    : Math.pow(10, (4 - engine.refLevelDb) / 20);
}
