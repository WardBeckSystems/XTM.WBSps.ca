/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { sampleRate, peakSensTrim } from "./state";
import { setRefLevel } from "./setRefLevel";
import { setVuBallistics } from "../vu/setVuBallistics";
import { VU_DEFAULT_F0, VU_DEFAULT_ZETA } from "../vu/constants";
import { updatePpmDecay } from "../ppm/updatePpmDecay";
import { setPhaseSmoothing } from "../phase/setPhaseSmoothing";
import { initBs1770Filters } from "../loudness/kweighting/initBs1770Filters";

/**
 * Initialize DSP filters and ballistics for a specific sample rate and reference alignment
 */
export function initDsp(sr: f64, refLevelDb: f64, peakTrim: f64): void {
  sampleRate = sr > 8000.0 ? sr : 48000.0;
  const dt: f64 = 1.0 / sampleRate;
  peakSensTrim = peakTrim;
  setRefLevel(refLevelDb, 0);

  // Standard VU (ANSI C16.5-1942): 300ms attack / 300ms release, 1.0-1.5% overshoot
  setVuBallistics(VU_DEFAULT_F0, VU_DEFAULT_ZETA);

  // PPM Attack & Release for the selected PPM type
  updatePpmDecay();

  // Phase smoothing (~300ms)
  setPhaseSmoothing(dt);

  // Initialize BS.1770-4 filters for sample rate
  initBs1770Filters(sampleRate);
}
