/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * PPM (quasi-peak) ballistic standards.
 * 1: DIN 45406 (10ms attack, 1500ms release / -20 dB in 1.5s)
 * 2: BBC BS 4297 / IEC 60268-10 (10ms attack, 2800ms release / -24 dB in 2.8s) - M433/M434 Scale 2 & 3
 * 3: Nordic N9 (5ms attack, 2000ms release / -20 dB in 2.0s)
 * 4: Fast Digital Quasi-Peak (1ms attack, 1000ms release / -20 dB in 1.0s)
 */

export type PpmTypeInput = 1 | 2 | 3 | 4 | 'type1' | 'type2' | 'scale2' | 'scale3' | 'nordic' | 'fast_peak';
export type PpmPresetKey = 'type1' | 'type2' | 'scale2' | 'scale3' | 'nordic' | 'fast_peak';

export interface PpmStandard {
  num: 1 | 2 | 3 | 4;
  key: PpmPresetKey;
  /** Integration (attack) time constant in seconds. */
  attack: number;
  /** Exponential release time constant in seconds. */
  tauDecay: number;
}

export const PPM_TYPE1_DIN: PpmStandard = { num: 1, key: 'type1', attack: 0.010, tauDecay: 1.5 / Math.LN10 };
export const PPM_TYPE2_BBC: PpmStandard = { num: 2, key: 'type2', attack: 0.010, tauDecay: (20.0 * 2.8) / (24.0 * Math.LN10) };
export const PPM_SCALE2: PpmStandard = { num: 2, key: 'scale2', attack: 0.010, tauDecay: (20.0 * 2.8) / (24.0 * Math.LN10) };
export const PPM_SCALE3: PpmStandard = { num: 2, key: 'scale3', attack: 0.010, tauDecay: (20.0 * 2.8) / (24.0 * Math.LN10) };
export const PPM_NORDIC: PpmStandard = { num: 3, key: 'nordic', attack: 0.005, tauDecay: 2.0 / Math.LN10 };
export const PPM_FAST_PEAK: PpmStandard = { num: 4, key: 'fast_peak', attack: 0.001, tauDecay: 1.0 / Math.LN10 };

export const PPM_STANDARDS: readonly PpmStandard[] = [PPM_TYPE1_DIN, PPM_TYPE2_BBC, PPM_SCALE2, PPM_SCALE3, PPM_NORDIC, PPM_FAST_PEAK];

/** Resolve a numeric or keyed PPM type; null when unrecognised. */
export function findPpmStandard(type: PpmTypeInput): PpmStandard | null {
  for (const std of PPM_STANDARDS) {
    if (type === std.num || type === std.key) return std;
  }
  return null;
}

/** Reference alignment offset: 0 dB PPM = -18 dBFS. */
export const PPM_REF_OFFSET_DB = 18.465;
