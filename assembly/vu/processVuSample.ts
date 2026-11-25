/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { VU_K_AVG, VU_NEEDLE_MIN, VU_NEEDLE_MAX } from "./constants";
import {
  vuB0, vuB1, vuB2, vuA1, vuA2,
  vu_x1_L, vu_x2_L, vu_y1_L, vu_y2_L, vu_p_L,
  vu_x1_R, vu_x2_R, vu_y1_R, vu_y2_R, vu_p_R,
} from "./state";

// One sample of VU needle ballistics for both channels (rectified, calibrated input).
// @ts-ignore: decorator
@inline
export function processVuSample(rA: f64, rB: f64): void {
  const vuInA: f64 = rA * VU_K_AVG;
  const ynA: f64 = vuB0 * vuInA + vuB1 * vu_x1_L + vuB2 * vu_x2_L - vuA1 * vu_y1_L - vuA2 * vu_y2_L;
  vu_x2_L = vu_x1_L;
  vu_x1_L = vuInA;
  vu_y2_L = vu_y1_L;
  vu_y1_L = ynA;
  vu_p_L = Math.max(VU_NEEDLE_MIN, Math.min(VU_NEEDLE_MAX, ynA));

  const vuInB: f64 = rB * VU_K_AVG;
  const ynB: f64 = vuB0 * vuInB + vuB1 * vu_x1_R + vuB2 * vu_x2_R - vuA1 * vu_y1_R - vuA2 * vu_y2_R;
  vu_x2_R = vu_x1_R;
  vu_x1_R = vuInB;
  vu_y2_R = vu_y1_R;
  vu_y1_R = ynB;
  vu_p_R = Math.max(VU_NEEDLE_MIN, Math.min(VU_NEEDLE_MAX, ynB));
}
