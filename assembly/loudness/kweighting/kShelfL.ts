/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { kShelf_b0, kShelf_b1, kShelf_b2, kShelf_a1, kShelf_a2, s1_x1_L, s1_x2_L, s1_y1_L, s1_y2_L } from "./state";

// K-weighting stage 1 (high shelf), channel L: one sample in, one sample out.
// @ts-ignore: decorator
@inline
export function kShelfL(x: f64): f64 {
  const y: f64 = kShelf_b0 * x + kShelf_b1 * s1_x1_L + kShelf_b2 * s1_x2_L - kShelf_a1 * s1_y1_L - kShelf_a2 * s1_y2_L;
  s1_x2_L = s1_x1_L; s1_x1_L = x;
  s1_y2_L = s1_y1_L; s1_y1_L = y;
  return y;
}
