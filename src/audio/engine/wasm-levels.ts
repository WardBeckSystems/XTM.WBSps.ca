/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WebAssembly DSP path: runs the block through the WASM engine and publishes
 * its result, plus BS.1770-4 gated integrated loudness & LRA over time.
 */

import type { XtmAudioEngine } from '../audio-engine';
import { vuDbOf } from './ballistics/vu';
import { phaseLedLinear } from './phase-correlation';
import {
  LUFS_ABSOLUTE_GATE_Z,
  accumulateIntegrated,
  integratedLufs,
  loudnessRange,
  pushShortTerm
} from './loudness';

/** Returns true when the WASM path handled the block. */
export function processWasmBlock(engine: XtmAudioEngine, inputL: Float32Array, inputR: Float32Array): boolean {
  if (!engine.wasmDsp.ready) return false;
  const ok = engine.wasmDsp.process(inputL, inputR, engine.wasmResult);
  if (!ok) return false;

  const r = engine.wasmResult;
  const lv = engine.currentLevels;
  lv.vu[0] = r.vuL;
  lv.vu[1] = r.vuR;
  lv.vuDb[0] = vuDbOf(r.vuL);
  lv.vuDb[1] = vuDbOf(r.vuR);
  lv.ppm[0] = r.ppmFracL;
  lv.ppm[1] = r.ppmFracR;
  lv.ppmDb[0] = r.ppmDbL;
  lv.ppmDb[1] = r.ppmDbR;
  lv.dbfs[0] = r.dbfsA;
  lv.dbfs[1] = r.dbfsB;
  lv.dbfs[2] = r.dbfsSum;
  lv.dbfs[3] = r.dbfsDiff;
  lv.lufs.m = r.lufsM;
  lv.lufs.s = r.lufsS;
  lv.lufs.mL = r.lufsML;
  lv.lufs.mR = r.lufsMR;
  lv.phaseCorrelation = r.phaseCorr;
  lv.hasAudio = r.hasAudio;
  lv.peak[0] = r.peakA;
  lv.peak[1] = r.peakB;

  lv.phaseLed = phaseLedLinear(r.phaseCorr, r.hasAudio);

  // BS.1770-4 Gated Integrated Loudness & LRA calculation over time
  const blockTotalZ = r.blockEnergy > 0 ? r.blockEnergy : (r.lufsM > -70 ? Math.pow(10, (r.lufsM + 0.691) / 10) : 0);

  if ((r.hasAudio || blockTotalZ > LUFS_ABSOLUTE_GATE_Z) && blockTotalZ > LUFS_ABSOLUTE_GATE_Z) { // > -70 LUFS absolute gate threshold
    accumulateIntegrated(engine.lufsState, blockTotalZ);
  }

  lv.lufs.i = integratedLufs(engine.lufsState);

  // Track LRA (Loudness Range)
  pushShortTerm(engine.lufsState, r.lufsS);
  lv.lufs.lra = loudnessRange(engine.lufsState);

  return true;
}
