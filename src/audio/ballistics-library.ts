/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM-4 — Analog VU & Needle Ballistics Library
 * Sourced from LikeDotAudio / APK.softapp.TEST.AUDIO.VuAnalog
 * Standards: ANSI C16.5-1942, DIN 45406, BBC BS 4297, ITU-R BS.1770-4
 */

export interface VuBallisticPreset {
  id: string;
  name: string;
  standard: string;
  attackMs: number;
  releaseMs: number;
  f0: number;
  zeta: number;
  notes: string;
}

export const VU_BALLISTICS_LIBRARY: Record<string, VuBallisticPreset> = {
  standard_vu: {
    id: 'standard_vu',
    name: 'Standard VU (ANSI C16.5)',
    standard: 'ANSI C16.5-1942',
    attackMs: 300,
    releaseMs: 300,
    f0: 2.16,
    zeta: 0.815,
    notes: 'ANSI C16.5-1942. Philosophy: Approximates perceived loudness. 0 VU = +4 dBu (-18 dBFS). 300ms attack/decay, 1-1.5% overshoot.'
  },
  console_standard: {
    id: 'console_standard',
    name: 'Console Standard',
    standard: 'Studio Console',
    attackMs: 200,
    releaseMs: 800,
    f0: 2.80,
    zeta: 0.750,
    notes: 'Studio Console Standard. 200ms attack, 800ms release.'
  },
  fast_response: {
    id: 'fast_response',
    name: 'Fast Response (Percussive)',
    standard: 'Transient Monitor',
    attackMs: 50,
    releaseMs: 200,
    f0: 5.50,
    zeta: 0.707,
    notes: 'Fast response for tracking percussive drum transients.'
  },
  slow_response: {
    id: 'slow_response',
    name: 'Slow Response (Heavy Inertia)',
    standard: 'Damped Movement',
    attackMs: 500,
    releaseMs: 2000,
    f0: 1.40,
    zeta: 0.850,
    notes: 'Slow response with heavy damped needle inertia.'
  },
  super_slow: {
    id: 'super_slow',
    name: 'Super Slow Vintage',
    standard: 'Galvanometer Drift',
    attackMs: 1000,
    releaseMs: 4000,
    f0: 0.80,
    zeta: 0.900,
    notes: 'Very heavy needle movement simulating vintage mechanical galvanometer drift.'
  },
  master_console: {
    id: 'master_console',
    name: 'Master Console Bank',
    standard: 'Master Bus Console',
    attackMs: 300,
    releaseMs: 1500,
    f0: 1.90,
    zeta: 0.800,
    notes: 'Master console broadcast monitoring with extended release.'
  },
  compressor_gr: {
    id: 'compressor_gr',
    name: 'Compressor Gain Reduction',
    standard: 'Dynamics GR',
    attackMs: 10,
    releaseMs: 100,
    f0: 9.00,
    zeta: 0.707,
    notes: 'Ultra-fast gain reduction dynamics.'
  }
};
