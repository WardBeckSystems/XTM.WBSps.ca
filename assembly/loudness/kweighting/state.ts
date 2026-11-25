/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// ITU-R BS.1770-4 K-weighting filter coefficients and per-channel state.

// Stage 1 (High Shelf) — defaults are the 48 kHz coefficients
export let kShelf_b0: f64 = 1.53512485958697;
export let kShelf_b1: f64 = -2.69169618940638;
export let kShelf_b2: f64 = 1.19839281085285;
export let kShelf_a1: f64 = -1.69065929318241;
export let kShelf_a2: f64 = 0.73248077421585;

export let s1_x1_L: f64 = 0.0;
export let s1_x2_L: f64 = 0.0;
export let s1_y1_L: f64 = 0.0;
export let s1_y2_L: f64 = 0.0;

export let s1_x1_R: f64 = 0.0;
export let s1_x2_R: f64 = 0.0;
export let s1_y1_R: f64 = 0.0;
export let s1_y2_R: f64 = 0.0;

// Stage 2 (High Pass RLB)
export let kHp_b0: f64 = 1.0;
export let kHp_b1: f64 = -2.0;
export let kHp_b2: f64 = 1.0;
export let kHp_a1: f64 = -1.99004745483398;
export let kHp_a2: f64 = 0.99007225036621;

export let s2_x1_L: f64 = 0.0;
export let s2_x2_L: f64 = 0.0;
export let s2_y1_L: f64 = 0.0;
export let s2_y2_L: f64 = 0.0;

export let s2_x1_R: f64 = 0.0;
export let s2_x2_R: f64 = 0.0;
export let s2_y1_R: f64 = 0.0;
export let s2_y2_R: f64 = 0.0;
