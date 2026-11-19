/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { K_SHELF_F0_HZ, K_SHELF_GAIN_DB, K_SHELF_VB_EXP, K_HP_F0_HZ, K_HP_Q } from "./constants";
import {
  kShelf_b0, kShelf_b1, kShelf_b2, kShelf_a1, kShelf_a2,
  kHp_b0, kHp_b1, kHp_b2, kHp_a1, kHp_a2,
} from "./state";

// Compute both K-weighting stages for the given sample rate.
export function initBs1770Filters(sr: f64): void {
  // High Shelf filter coefficients for ITU-R BS.1770-4
  const f0: f64 = K_SHELF_F0_HZ;
  const gainDb: f64 = K_SHELF_GAIN_DB;
  const Q: f64 = 1.0 / Math.SQRT2;
  const K: f64 = Math.tan(Math.PI * f0 / sr);
  const Vh: f64 = Math.pow(10.0, gainDb / 20.0);
  const Vb: f64 = Math.pow(Vh, K_SHELF_VB_EXP);

  const a0: f64 = 1.0 + K / Q + K * K;
  kShelf_b0 = (Vh + Vb * K / Q + K * K) / a0;
  kShelf_b1 = 2.0 * (K * K - Vh) / a0;
  kShelf_b2 = (Vh - Vb * K / Q + K * K) / a0;
  kShelf_a1 = 2.0 * (K * K - 1.0) / a0;
  kShelf_a2 = (1.0 - K / Q + K * K) / a0;

  // High Pass RLB filter coefficients
  const fHp: f64 = K_HP_F0_HZ;
  const QHp: f64 = K_HP_Q;
  const KHp: f64 = Math.tan(Math.PI * fHp / sr);
  const a0Hp: f64 = 1.0 + KHp / QHp + KHp * KHp;

  kHp_b0 = 1.0 / a0Hp;
  kHp_b1 = -2.0 / a0Hp;
  kHp_b2 = 1.0 / a0Hp;
  kHp_a1 = 2.0 * (KHp * KHp - 1.0) / a0Hp;
  kHp_a2 = (1.0 - KHp / QHp + KHp * KHp) / a0Hp;
}
