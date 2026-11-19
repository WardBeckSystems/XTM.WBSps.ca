/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
// PPM Type II (BBC BS 4297 / IEC 60268-10): 10ms attack, -24 dB in 2.8s
export const PPM_TYPE_II: i32 = 2;
export const PPM_TYPE_II_ATTACK_S: f64 = 0.010;
export const PPM_TYPE_II_TAU_DEC_S: f64 = (20.0 * 2.8) / (24.0 * 2.302585092994046);
