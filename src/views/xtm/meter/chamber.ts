/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Meter chamber: recess shadow gradients, recess shadow overlay and molded bezel rim. */
import { MW, MH } from '../layout/wbs-layout';

export const CHAMBER_GRADIENTS = `<linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.68"/>
          <stop offset="45%" stop-color="#000000" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="50%" stop-color="#000000" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="xch_left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.50"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
        </linearGradient>`;

/** Chamber recess shadows; also closes the clip group opened by the face. */
export function chamberShadows(x0: number, y0: number): string {
  return `
      <rect x="${x0}" y="${y0}" width="${MW}" height="54" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${x0}" y="${y0 + MH - 42}" width="${MW}" height="42" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${x0}" y="${y0}" width="32" height="${MH}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${x0 + MW - 32}" y="${y0}" width="32" height="${MH}" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${x0 + 1}" y="${y0 + 1}" width="${MW - 2}" height="${MH - 2}" rx="27" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="2.5" pointer-events="none"/>
    </g>`;
}

/** Molded bezel dark stepped rim */
export function bezelRim(x0: number, y0: number): string {
  return `
    <path d="M${x0 - 4} ${y0 + MH - 24} L${x0 - 4} ${y0 + MH - 18} A24 24 0 0 0 ${x0 + 18} ${y0 + MH + 4} L${x0 + MW - 18} ${y0 + MH + 4} A24 24 0 0 0 ${x0 + MW + 4} ${y0 + MH - 18} L${x0 + MW + 4} ${y0 + MH - 24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
    <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
    <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>`;
}
