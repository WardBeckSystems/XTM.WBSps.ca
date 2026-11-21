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
        </linearGradient>
        <linearGradient id="meterGlassSheenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.10"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.02"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>`;

/** Chamber recess shadows; also closes the clip group opened by the face. */
export function chamberShadows(x0: number, y0: number): string {
  return `
      <!-- Recessed Chamber Inner Glass Shadows -->
      <rect x="${x0}" y="${y0}" width="${MW}" height="28" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${x0}" y="${y0 + MH - 28}" width="${MW}" height="28" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${x0}" y="${y0}" width="20" height="${MH}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${x0 + MW - 20}" y="${y0}" width="20" height="${MH}" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${x0 + 1}" y="${y0 + 1}" width="${MW - 2}" height="${MH - 2}" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen -->
      <path d="M ${x0 + 6} ${y0 + 6} L ${x0 + MW * 0.72} ${y0 + 6} L ${x0 + 6} ${y0 + MH * 0.82} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${x0 + 6}" y="${(y0 + MH * 0.44).toFixed(1)}" width="${MW - 12}" height="1.6" fill="#ffffff" opacity="0.06" pointer-events="none"/>
    </g>`;
}

/** Molded bezel dark stepped rim (open viewport, hairline outline, NO METER COVERS) */
export function bezelRim(x0: number, y0: number, _cx?: number): string {
  return `
    <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="6" fill="none" stroke="#14181f" stroke-width="2.5"/>
    <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5" fill="none" stroke="#0a0c0f" stroke-width="2"/>`;
}
