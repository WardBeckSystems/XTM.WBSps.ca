/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { PHASE_DENOM_EPS } from "./constants";
import { phase_sL2, phase_sR2, phase_sLR, phase_corr } from "./state";

// Normalised correlation (-1..+1) from the smoothed products; +1 when there is no signal.
// @ts-ignore: decorator
@inline
export function updatePhaseCorrelation(hasSignal: boolean): void {
  const denom: f64 = Math.sqrt(phase_sL2 * phase_sR2) + PHASE_DENOM_EPS;
  phase_corr = hasSignal ? Math.max(-1.0, Math.min(1.0, phase_sLR / denom)) : 1.0;
}
