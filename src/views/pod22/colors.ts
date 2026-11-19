/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** POD-22 colour map for lit LED segments and the centre scale numerals. */

export const LED_OFF_FILL = '#111317';

export function segColor(p: number, maxP: number): string {
  if (p === maxP) return '#dc2626';                  // PK Overload deep smoked red
  if (p >= 40) return '#ef4444';                     // DISTORTION RANGE (+15 to +22)
  if (p === 25) return '#ef4444';                    // 0 VU alignment RED
  if (p === 24 || p === 26) return '#facc15';        // -1 and +1 YELLOW
  if (p < 0) return '#10b981';                       // INFINITE SILENCE (-100 to -45)
  if (p <= 18) return '#22c55e';                     // Broadcast smoked green (-45 to -7)
  if (p <= 23) return '#f59e0b';                     // Smoked amber caution (-6 to -2)
  if (p <= 33) return '#f97316';                     // Smoked warning orange (+2 to +8)
  return '#ef4444';                                  // Deep peak red (+9 to +14)
}

export function scaleNumColor(p: number, maxP: number): string {
  const isPk = p === maxP;
  if (p === 25 || isPk) return '#ef4444'; // 0 and PK red
  if (p === 24 || p === 26) return '#facc15'; // -1 and +1 yellow
  if (p >= 40) return '#ef4444'; // Distortion range red
  if (p > 26) return '#f97316'; // +2 to +14 orange
  if (p >= 19) return '#f59e0b'; // -6 to -2 amber
  if (p < 0) return '#10b981'; // Infinite silence emerald green
  return '#94a3b8';
}
