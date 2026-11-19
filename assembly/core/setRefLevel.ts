/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { calGain } from "./state";

export function setRefLevel(refLevelDb: f64, isDigital: i32): void {
  // Mode D: Digital Reference alignment relative to -18 dBFS (0 VU = -18 dBFS)
  // Mode A: Analog Reference alignment relative to +4 dBu (0 VU = +4 dBu)
  if (isDigital != 0) {
    calGain = Math.pow(10.0, (-18.0 - refLevelDb) / 20.0);
  } else {
    calGain = Math.pow(10.0, (4.0 - refLevelDb) / 20.0);
  }
}
