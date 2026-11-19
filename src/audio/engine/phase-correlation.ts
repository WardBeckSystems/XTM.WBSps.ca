/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Stereo phase correlation (Pearson product-moment, 300 ms integration)
 * and its mapping onto the 8-LED correlation display.
 */

import type { XtmAudioEngine } from '../audio-engine';
import type { PhaseCorrelationState } from './types';

/** Phase integration alpha (300 ms time constant) */
export function computePhaseAlpha(engine: XtmAudioEngine, fs: number): void {
  engine.phaseAlpha = 1.0 - Math.exp(-1.0 / (0.300 * fs));
}

/** Accumulate one calibrated stereo sample pair. */
export function phaseAccumulate(st: PhaseCorrelationState, alpha: number, sA: number, sB: number): void {
  st.sL2 += alpha * (sA * sA - st.sL2);
  st.sR2 += alpha * (sB * sB - st.sR2);
  st.sLR += alpha * (sA * sB - st.sLR);
}

/** Correlation index (-1.0 to +1.0); 1.0 when there is no signal. */
export function phaseCorrelationOf(st: PhaseCorrelationState, hasSignal: boolean): number {
  const denom = Math.sqrt(st.sL2 * st.sR2) + 1e-9;
  return hasSignal ? Math.max(-1.0, Math.min(1.0, st.sLR / denom)) : 1.0;
}

/**
 * Map correlation to 8 discrete LEDs (0 = -1.0 anti-phase, 7 = +1.0 mono in-phase)
 * using the JS-path thresholds; -1 when there is no signal.
 */
export function phaseLedOf(corr: number, hasSignal: boolean): number {
  let pLed = -1;
  if (hasSignal) {
    if (corr <= -0.75) pLed = 0;
    else if (corr <= -0.50) pLed = 1;
    else if (corr <= -0.20) pLed = 2;
    else if (corr <= 0.10)  pLed = 3;
    else if (corr <= 0.40)  pLed = 4;
    else if (corr <= 0.70)  pLed = 5;
    else if (corr <= 0.90)  pLed = 6;
    else pLed = 7;
  }
  return pLed;
}

/** Linear LED index used for the WASM path; -1 when there is no audio. */
export function phaseLedLinear(corr: number, hasAudio: boolean): number {
  let pIdx = Math.round((corr + 1.0) * 3.5);
  if (pIdx < 0) pIdx = 0;
  if (pIdx > 7) pIdx = 7;
  return hasAudio ? pIdx : -1;
}
