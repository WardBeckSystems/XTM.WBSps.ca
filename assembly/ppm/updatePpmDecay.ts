/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
import { sampleRate } from "../core/state";
import { ppmType, ppmAttCoeff, ppmDecCoeff } from "./state";
import { PPM_TYPE_I, PPM_TYPE_I_ATTACK_S, PPM_TYPE_I_TAU_DEC_S } from "./standards/typeI_DIN45406";
import { PPM_TYPE_II, PPM_TYPE_II_ATTACK_S, PPM_TYPE_II_TAU_DEC_S } from "./standards/typeII_BBC_BS4297";
import { PPM_NORDIC_N9, PPM_NORDIC_N9_ATTACK_S, PPM_NORDIC_N9_TAU_DEC_S } from "./standards/nordicN9";
import { PPM_FAST_DIGITAL, PPM_FAST_DIGITAL_ATTACK_S, PPM_FAST_DIGITAL_TAU_DEC_S } from "./standards/fastDigitalQP";

/**
 * Configure Quasi-Peak PPM attack/decay coefficients for the selected type
 * at the current sample rate (Type II when the type is unknown).
 */
export function updatePpmDecay(): void {
  const dt: f64 = 1.0 / sampleRate;
  let attMs: f64 = PPM_TYPE_II_ATTACK_S;
  let tauDec: f64 = PPM_TYPE_II_TAU_DEC_S; // default Type II

  if (ppmType === PPM_TYPE_I) {
    attMs = PPM_TYPE_I_ATTACK_S;
    tauDec = PPM_TYPE_I_TAU_DEC_S;
  } else if (ppmType === PPM_TYPE_II) {
    attMs = PPM_TYPE_II_ATTACK_S;
    tauDec = PPM_TYPE_II_TAU_DEC_S;
  } else if (ppmType === PPM_NORDIC_N9) {
    attMs = PPM_NORDIC_N9_ATTACK_S;
    tauDec = PPM_NORDIC_N9_TAU_DEC_S;
  } else if (ppmType === PPM_FAST_DIGITAL) {
    attMs = PPM_FAST_DIGITAL_ATTACK_S;
    tauDec = PPM_FAST_DIGITAL_TAU_DEC_S;
  }

  ppmAttCoeff = 1.0 - Math.exp(-dt / attMs);
  ppmDecCoeff = Math.exp(-dt / tauDec);
}
