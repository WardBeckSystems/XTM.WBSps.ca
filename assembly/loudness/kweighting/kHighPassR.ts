/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { kHp_b0, kHp_b1, kHp_b2, kHp_a1, kHp_a2, s2_x1_R, s2_x2_R, s2_y1_R, s2_y2_R } from "./state";

// K-weighting stage 2 (RLB high pass), channel R: one sample in, one sample out.
// @ts-ignore: decorator
@inline
export function kHighPassR(x: f64): f64 {
  const y: f64 = kHp_b0 * x + kHp_b1 * s2_x1_R + kHp_b2 * s2_x2_R - kHp_a1 * s2_y1_R - kHp_a2 * s2_y2_R;
  s2_x2_R = s2_x1_R; s2_x1_R = x;
  s2_y2_R = s2_y1_R; s2_y1_R = y;
  return y;
}
