/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
// ITU-R BS.1770-4 K-weighting filter design parameters.

// Stage 1: high shelf
export const K_SHELF_F0_HZ: f64 = 1500.0;
export const K_SHELF_GAIN_DB: f64 = 4.0;
export const K_SHELF_VB_EXP: f64 = 0.499666774155;

// Stage 2: RLB high pass
export const K_HP_F0_HZ: f64 = 38.0;
export const K_HP_Q: f64 = 0.5;
