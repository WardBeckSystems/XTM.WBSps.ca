/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { phaseAlpha, phase_sL2, phase_sR2, phase_sLR } from "./state";

// One sample of the smoothed L², R² and L·R products (calibrated input).
// @ts-ignore: decorator
@inline
export function processPhaseSample(sA: f64, sB: f64): void {
  phase_sL2 += phaseAlpha * (sA * sA - phase_sL2);
  phase_sR2 += phaseAlpha * (sB * sB - phase_sR2);
  phase_sLR += phaseAlpha * (sA * sB - phase_sLR);
}
