/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { peakSensTrim } from "../core/state";
import { PPM_REF_OFFSET_DB } from "./constants";

// PPM envelope -> PPM dB (0 dB PPM = -18 dBFS reference level), including peak trim.
// @ts-ignore: decorator
@inline
export function ppmEnvToDb(env: f64): f64 {
  return env > 1e-6 ? 20.0 * Math.log10(env) + PPM_REF_OFFSET_DB + peakSensTrim : -120.0;
}
