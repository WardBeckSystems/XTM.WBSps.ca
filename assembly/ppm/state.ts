/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
// PPM Ballistics (IEC 60268-10 / DIN 45406 / BBC BS 4297) state.
import { PPM_TYPE_II } from "./standards/typeII_BBC_BS4297";

export let ppmType: i32 = PPM_TYPE_II; // 1 = Type I (DIN 45406), 2 = Type II (BBC BS 4297), 3 = Nordic N9, 4 = Fast digital
export let ppmAttCoeff: f64 = 0.0;
export let ppmDecCoeff: f64 = 0.0;
export let ppm_env_L: f64 = 0.0;
export let ppm_env_R: f64 = 0.0;
