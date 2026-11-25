/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { sampleRate } from "../core/state";
import { vuB0, vuB1, vuB2, vuA1, vuA2 } from "./state";

// Bilinear-transformed 2nd-order low-pass needle model (natural frequency f0, damping zeta).
export function setVuBallistics(f0: f64, zeta: f64): void {
  const dt: f64 = 1.0 / sampleRate;
  const K: f64 = 2.0 / dt;
  const w0: f64 = 2.0 * Math.PI * f0;

  const a0: f64 = K * K + 2.0 * zeta * w0 * K + w0 * w0;
  vuB0 = (w0 * w0) / a0;
  vuB1 = (2.0 * w0 * w0) / a0;
  vuB2 = vuB0;
  vuA1 = (2.0 * (w0 * w0 - K * K)) / a0;
  vuA2 = (K * K - 2.0 * zeta * w0 * K + w0 * w0) / a0;
}
