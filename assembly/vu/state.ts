/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// VU ballistics biquad coefficients and per-channel state.

// VU Ballistics Coefficients
export let vuB0: f64 = 0.0;
export let vuB1: f64 = 0.0;
export let vuB2: f64 = 0.0;
export let vuA1: f64 = 0.0;
export let vuA2: f64 = 0.0;

// VU State (L & R)
export let vu_x1_L: f64 = 0.0;
export let vu_x2_L: f64 = 0.0;
export let vu_y1_L: f64 = 0.0;
export let vu_y2_L: f64 = 0.0;
export let vu_p_L: f64 = 0.0;

export let vu_x1_R: f64 = 0.0;
export let vu_x2_R: f64 = 0.0;
export let vu_y1_R: f64 = 0.0;
export let vu_y2_R: f64 = 0.0;
export let vu_p_R: f64 = 0.0;
