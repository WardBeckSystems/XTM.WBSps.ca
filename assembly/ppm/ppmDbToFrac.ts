/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
// PPM dB -> needle fraction (linear above -12 dB, compressed tail below).
// @ts-ignore: decorator
@inline
export function ppmDbToFrac(db: f64): f64 {
  return db >= -12.0 ? (db + 12.0) / 24.0 : -0.12 * (1.0 - Math.pow(10.0, (db + 12.0) / 20.0));
}
