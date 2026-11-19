/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * PPM peak ballistics (IEC 60268-10 quasi-peak): coefficient setup, per-sample
 * envelope follower and scale conversion.
 */

import type { XtmAudioEngine } from '../../audio-engine';
import type { PpmStateChannel } from '../types';
import {
  PPM_REF_OFFSET_DB,
  PPM_TYPE1_DIN,
  PPM_TYPE2_BBC,
  findPpmStandard,
  type PpmTypeInput
} from './ppm-standards';

/**
 * PPM coefficients used by calculateCoefficients (10ms attack, Type I or Type II release)
 */
export function computeDefaultPpmCoefficients(engine: XtmAudioEngine, fs: number): void {
  engine.ppmAttack = 0.010;
  engine.ppmAttCoeff = 1.0 - Math.exp(-1.0 / (engine.ppmAttack * fs));
  const tauDecay = (engine.ppmType === 1) ? PPM_TYPE1_DIN.tauDecay : PPM_TYPE2_BBC.tauDecay;
  engine.ppmDecCoeff = Math.exp(-1.0 / (tauDecay * fs));
  if (engine.wasmDsp.ready) {
    engine.wasmDsp.setPpmType(engine.ppmType);
  }
}

/**
 * Set PPM Ballistics (see ppm-standards.ts for the four supported standards).
 */
export function setPpmType(engine: XtmAudioEngine, type: PpmTypeInput): void {
  const std = findPpmStandard(type);
  if (std) engine.ppmBallisticPreset = std.key;
  const params = std || PPM_TYPE2_BBC;
  const tNum = params.num;

  engine.ppmType = (tNum === 1 ? 1 : 2);
  const fs = engine.ctx ? engine.ctx.sampleRate : 48000;

  engine.ppmAttack = params.attack;
  engine.ppmAttCoeff = 1.0 - Math.exp(-1.0 / (params.attack * fs));
  engine.ppmDecCoeff = Math.exp(-1.0 / (params.tauDecay * fs));
  if (engine.wasmDsp && engine.wasmDsp.ready) {
    engine.wasmDsp.setPpmType(tNum);
  }
}

/** Advance the quasi-peak envelope by one rectified sample. */
export function ppmStep(engine: XtmAudioEngine, st: PpmStateChannel, r: number): void {
  if (r > st.env) {
    st.env += (r - st.env) * engine.ppmAttCoeff;
  } else {
    st.env *= engine.ppmDecCoeff;
  }
}

/** Envelope to calibrated PPM dB (0 dB PPM = -18 dBFS) plus SENS trim. */
export function ppmEnvToDb(env: number, trim: number): number {
  return env > 1e-6 ? 20 * Math.log10(env) + PPM_REF_OFFSET_DB + trim : -Infinity;
}

/** PPM dB to the normalised -12..+12 scale fraction. */
export function ppmDbToFrac(ppmDb: number): number {
  return ppmDb >= -12 ? (ppmDb + 12) / 24 : -0.12 * (1 - Math.pow(10, (ppmDb + 12) / 20));
}
