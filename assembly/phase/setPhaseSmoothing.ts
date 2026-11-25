/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { PHASE_SMOOTHING_TAU_S } from "./constants";
import { phaseAlpha } from "./state";

// One-pole smoothing coefficient for the correlation integrators at sample period dt.
// @ts-ignore: decorator
@inline
export function setPhaseSmoothing(dt: f64): void {
  phaseAlpha = 1.0 - Math.exp(-dt / PHASE_SMOOTHING_TAU_S);
}
