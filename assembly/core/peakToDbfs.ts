/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// Digital Peak Full Scale (dBFS) from a block's absolute sample peak.
// @ts-ignore: decorator
@inline
export function peakToDbfs(peak: f32): f64 {
  return peak > 1e-6 ? 20.0 * Math.log10(<f64>peak) : -120.0;
}
