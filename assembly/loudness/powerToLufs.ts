/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { LUFS_OFFSET, LUFS_FLOOR, LUFS_POWER_GATE } from "./constants";

// Mean-square power -> LUFS (floored at -70).
// @ts-ignore: decorator
@inline
export function powerToLufs(z: f64): f64 {
  return (z > LUFS_POWER_GATE) ? LUFS_OFFSET + 10.0 * Math.log10(z) : LUFS_FLOOR;
}
