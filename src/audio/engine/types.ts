/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Shared engine state shapes and their initial-value factories.
 */

import type { WasmDspResult } from '../../dsp/wasm-dsp';

export interface VuCoeffConfig {
  f0: number;
  zeta: number;
}

export interface VuStateChannel {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  p: number;
}

export interface PpmStateChannel {
  env: number;
  q: number;
  qv: number;
}

export interface PhaseCorrelationState {
  sL2: number;
  sR2: number;
  sLR: number;
  correlation: number;
  led: number;
}

export interface BiquadState {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface LufsState {
  stage1: [BiquadState, BiquadState];
  stage2: [BiquadState, BiquadState];
  meanSquareM_L: number;
  meanSquareM_R: number;
  meanSquareS_L: number;
  meanSquareS_R: number;
  sumEnergy: number;
  blockCount: number;
  shortTermHist: number[];
}

export interface CurrentLevelsState {
  vu: [number, number];
  ppm: [number, number];
  vuDb: [number, number];
  ppmDb: [number, number];
  dbfs: [number, number, number, number];
  lufs: {
    m: number;
    s: number;
    i: number;
    lra: number;
    mL: number;
    mR: number;
  };
  rmsDb: [number, number];
  phaseCorrelation: number;
  phaseLed: number;
  peak: [boolean, boolean];
  hasAudio: boolean;
}

export type SourceType = 'none' | 'mic' | 'system' | 'test';

/** Default VU movement coefficients (ANSI C16.5-1942 electromechanical 2nd-order ODE). */
export function createVuCoeffs(): Record<string, VuCoeffConfig> {
  return {
    pimson: { f0: 2.16, zeta: 0.815 },
    pimsom: { f0: 2.16, zeta: 0.815 },
    simpson: { f0: 2.16, zeta: 0.815 },
    fisam: { f0: 2.40, zeta: 0.850 },
    sifam: { f0: 2.40, zeta: 0.850 }
  };
}

export function createVuState(): [VuStateChannel, VuStateChannel] {
  return [
    { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }, // Ch A (Left)
    { x1: 0, x2: 0, y1: 0, y2: 0, p: 0 }  // Ch B (Right)
  ];
}

export function createPpmState(): [PpmStateChannel, PpmStateChannel] {
  return [
    { env: 0, q: -0.12, qv: 0 },
    { env: 0, q: -0.12, qv: 0 }
  ];
}

export function createPhaseState(): PhaseCorrelationState {
  return { sL2: 0, sR2: 0, sLR: 0, correlation: 1.0, led: 7 };
}

export function createLufsState(): LufsState {
  return {
    stage1: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
    stage2: [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }],
    meanSquareM_L: 0,
    meanSquareM_R: 0,
    meanSquareS_L: 0,
    meanSquareS_R: 0,
    sumEnergy: 0,
    blockCount: 0,
    shortTermHist: []
  };
}

/** Silent metering output (queried by visualizer on animation frame). */
export function createCurrentLevels(): CurrentLevelsState {
  return {
    vu: [0, 0],       // Deflection fraction: 0.708 = 0 VU, 1.0 = +3 VU
    ppm: [-0.12, -0.12], // Normalized scale: 0 = -12 dB, 1.0 = +12 dB
    vuDb: [-Infinity, -Infinity],
    ppmDb: [-Infinity, -Infinity],
    dbfs: [-60, -60, -60, -60],
    lufs: {
      m: -60,
      s: -60,
      i: -60,
      lra: 0,
      mL: -60,
      mR: -60
    },
    rmsDb: [-60, -60],
    phaseCorrelation: 1.0,
    phaseLed: -1,     // 0..7
    peak: [false, false],
    hasAudio: false
  };
}

export function createWasmResult(): WasmDspResult {
  return {
    vuL: 0,
    vuR: 0,
    ppmDbL: -120,
    ppmDbR: -120,
    ppmFracL: 0,
    ppmFracR: 0,
    dbfsA: -120,
    dbfsB: -120,
    dbfsSum: -120,
    dbfsDiff: -120,
    lufsM: -70,
    lufsS: -70,
    lufsML: -70,
    lufsMR: -70,
    blockEnergy: 0,
    phaseCorr: 1.0,
    hasAudio: false,
    peakA: false,
    peakB: false
  };
}
