/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// Standard VU (ANSI C16.5-1942) definition.

// 0 VU = +4 dBu (-18 dBFS). Scale factor to map full-wave rectified sine
// to exactly 0.707946 (-3 dB / 0 VU):
export const VU_K_AVG: f64 = 8.8458296;

// 300ms attack / 300ms release, 1.0-1.5% overshoot
export const VU_DEFAULT_F0: f64 = 2.16;
export const VU_DEFAULT_ZETA: f64 = 0.815;

// Needle travel clamp (pin stops)
export const VU_NEEDLE_MIN: f64 = -0.03;
export const VU_NEEDLE_MAX: f64 = 1.15;
