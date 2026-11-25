/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { ppmAttCoeff, ppmDecCoeff, ppm_env_L, ppm_env_R } from "./state";

// One sample of quasi-peak envelope ballistics for both channels (rectified, calibrated input).
// @ts-ignore: decorator
@inline
export function processPpmSample(rA: f64, rB: f64): void {
  if (rA > ppm_env_L) {
    ppm_env_L += (rA - ppm_env_L) * ppmAttCoeff;
  } else {
    ppm_env_L *= ppmDecCoeff;
  }

  if (rB > ppm_env_R) {
    ppm_env_R += (rB - ppm_env_R) * ppmAttCoeff;
  } else {
    ppm_env_R *= ppmDecCoeff;
  }
}
