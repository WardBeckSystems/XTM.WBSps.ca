/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// LUFS integration windows and scale (ITU-R BS.1770-4 / EBU R128).
export const LUFS_MOMENTARY_TAU_S: f64 = 0.400; // 400ms momentary window
export const LUFS_SHORT_TERM_TAU_S: f64 = 3.000; // 3.0s short-term window
export const LUFS_OFFSET: f64 = -0.691;
export const LUFS_FLOOR: f64 = -70.0;
export const LUFS_POWER_GATE: f64 = 1e-12;
