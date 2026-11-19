/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Recomputes every sample-rate dependent coefficient set (VU, PPM, phase,
 * K-weighting, loudness time constants).
 */

import type { XtmAudioEngine } from '../audio-engine';
import { computeVuCoefficients } from './ballistics/vu';
import { computeDefaultPpmCoefficients } from './ballistics/ppm';
import { computePhaseAlpha } from './phase-correlation';
import { computeKWeightingCoefficients } from './k-weighting';
import { computeLufsTimeConstants } from './loudness';

export function calculateCoefficients(engine: XtmAudioEngine): void {
  if (!engine.ctx) return;
  const fs = engine.ctx.sampleRate;
  computeVuCoefficients(engine, fs);
  computeDefaultPpmCoefficients(engine, fs);
  computePhaseAlpha(engine, fs);
  computeKWeightingCoefficients(engine, fs);
  computeLufsTimeConstants(engine, fs);
}
