/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { LUFS_MOMENTARY_TAU_S, LUFS_SHORT_TERM_TAU_S } from "./constants";
import { msM_L, msM_R, msS_L, msS_R } from "./state";

// Fold one block's K-weighted mean squares into the momentary / short-term integrators.
// @ts-ignore: decorator
@inline
export function integrateLoudness(zBlockL: f64, zBlockR: f64, blockDt: f64, hasSignal: boolean): void {
  const alphaM: f64 = 1.0 - Math.exp(-blockDt / LUFS_MOMENTARY_TAU_S);
  const alphaS: f64 = 1.0 - Math.exp(-blockDt / LUFS_SHORT_TERM_TAU_S);

  if (hasSignal) {
    msM_L += alphaM * (zBlockL - msM_L);
    msM_R += alphaM * (zBlockR - msM_R);

    msS_L += alphaS * (zBlockL - msS_L);
    msS_R += alphaS * (zBlockR - msS_R);
  } else {
    // Smooth decay to zero during silence
    msM_L += alphaM * (0.0 - msM_L);
    msM_R += alphaM * (0.0 - msM_R);

    msS_L += alphaS * (0.0 - msS_L);
    msS_R += alphaS * (0.0 - msS_R);
  }
}
