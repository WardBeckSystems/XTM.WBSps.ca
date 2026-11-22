/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Clock Hands: Exact electromechanical VU meter needle geometry
 * for Hour, Minute, and Second hands, styled after the Ward-Beck Systems
 * VU meter movement (tapered shaft swelling into teardrop bulb, knife-edge tip,
 * center specular spine, rear counterweight, and concentric pivot hub).
 */

import type { ClockTheme } from './types';

const VU_ORANGE = '#f4902c'; // Authentic Ward-Beck R244 G144 B44 VU needle orange
const PPM_YELLOW = '#facc15'; // Authentic yellow PPM indicator wand

/**
 * Builds the authentic VU meter needle path (M405 / Pimson movement)
 * for a needle of given tip length L (tip at y = -L, pivot at y = 0).
 */
function renderVuNeedleGeometry(L: number, bulbScale = 1.0, color = VU_ORANGE): { body: string; shadow: string } {
  const tipY = -L;
  const py = 0;
  const b1 = tipY + 6 * bulbScale;
  const b2 = tipY + 10 * bulbScale;
  const b3 = tipY + 16 * bulbScale;
  const b4 = tipY + 20 * bulbScale;
  const b5 = tipY + 24 * bulbScale;
  const b6 = tipY + 28 * bulbScale;
  const b7 = tipY + 30 * bulbScale;

  const wMax = 5.8 * bulbScale;
  const wMid = 3.6 * bulbScale;
  const wShaft = 1.2;

  // Exact VU needle silhouette from wbsOrangeVuNeedle
  const pathD = `
    M 0 ${tipY}
    L 0.6 ${b1}
    C 1.2 ${b2}, ${wMax} ${b3}, ${wMax} ${b4}
    C ${wMax} ${b5}, ${wMid} ${b6}, 1.2 ${b7}
    L ${wShaft} ${py}
    L -${wShaft} ${py}
    L -1.2 ${b7}
    C -${wMid} ${b6}, -${wMax} ${b5}, -${wMax} ${b4}
    C -${wMax} ${b3}, -1.2 ${b2}, -0.6 ${b1}
    Z`;

  const tailY = 22 * bulbScale;
  const tailR = 6.8 * bulbScale;

  const shadowD = `
    M 2 ${tipY + 3}
    L 2.6 ${b1 + 3}
    C 3.2 ${b2 + 3}, ${wMax + 2} ${b3 + 3}, ${wMax + 2} ${b4 + 3}
    C ${wMax + 2} ${b5 + 3}, ${wMid + 2} ${b6 + 3}, 3.2 ${b7 + 3}
    L ${wShaft + 2} ${py + 3}
    L ${-wShaft + 2} ${py + 3}
    L ${-1.2 + 2} ${b7 + 3}
    C ${-wMid + 2} ${b6 + 3}, ${-wMax + 2} ${b5 + 3}, ${-wMax + 2} ${b4 + 3}
    C ${-wMax + 2} ${b3 + 3}, 0.8 ${b2 + 3}, 1.4 ${b1 + 3}
    Z`;

  const shadow = `
    <g opacity="0.35">
      <path d="${shadowD}" fill="#000000" />
      <circle cx="2" cy="${tailY + 3}" r="${tailR}" fill="#000000" />
    </g>
  `;

  const body = `
    <path d="${pathD}" fill="${color}" />
    <!-- Center Specular Spine Highlight -->
    <line x1="0" y1="${tailY - 2}" x2="0" y2="${tipY + 4}" stroke="rgba(255,255,255,0.48)" stroke-width="0.9" />
    <!-- Rear Counterweight Disc -->
    <circle cx="0" cy="${tailY}" r="${tailR}" fill="${color}" />
    <circle cx="0" cy="${tailY}" r="${tailR * 0.4}" fill="#111317" opacity="0.6" />
  `;

  return { body, shadow };
}

export function renderClockHands(theme: ClockTheme): string {
  // Hour hand: L = 110, slightly wider VU teardrop bulb
  const hourHand = renderVuNeedleGeometry(110, 1.15, VU_ORANGE);

  // Minute hand: L = 168, reaching precisely to the meter scale arc
  const minHand = renderVuNeedleGeometry(168, 1.0, VU_ORANGE);

  return `
    <!-- Rotating Hour Hand Group (VU Meter Needle Profile) -->
    <g id="clockHourHand" transform="rotate(0 0 0)">
      ${hourHand.shadow}
      ${hourHand.body}
    </g>

    <!-- Rotating Minute Hand Group (VU Meter Needle Profile) -->
    <g id="clockMinuteHand" transform="rotate(0 0 0)">
      ${minHand.shadow}
      ${minHand.body}
    </g>

    <!-- Rotating Second Hand Group (Master PPM Sweep Wand with Balance Disc) -->
    <g id="clockSecondHand" transform="rotate(0 0 0)">
      <!-- Drop Shadow -->
      <g transform="translate(2, 3)" opacity="0.32">
        <line x1="0" y1="44" x2="0" y2="-192" stroke="#000000" stroke-width="2.6" stroke-linecap="round" />
        <circle cx="0" cy="34" r="7" fill="#000000" />
      </g>
      <!-- Second Hand Body: Luminous Yellow Sweep Wand -->
      <line x1="0" y1="42" x2="0" y2="-190" stroke="${PPM_YELLOW}" stroke-width="2.2" stroke-linecap="round" />
      <line x1="0" y1="32" x2="0" y2="-188" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.6" />
      <!-- Arrowhead Spade Pointer Tip -->
      <polygon points="-3,-172 0,-191 3,-172 0,-168" fill="${PPM_YELLOW}" />
      <!-- Rear Counterweight Disc -->
      <circle cx="0" cy="34" r="6.5" fill="${PPM_YELLOW}" />
      <circle cx="0" cy="34" r="2.8" fill="#111317" />
    </g>

    <!-- Multi-Tiered Simpson/Sifam Meter Concentric Center Hub -->
    <g id="clockCenterHub" pointer-events="none">
      <!-- Outer Matte Collar -->
      <circle cx="0" cy="0" r="13" fill="url(#clockBossGrad)" stroke="#1a1c22" stroke-width="1.2" />
      <!-- Metallic Stepped Washer -->
      <circle cx="0" cy="0" r="8" fill="#2d3748" stroke="#4a5568" stroke-width="0.8" />
      <!-- Center Concentric Pivot Pin -->
      <circle cx="0" cy="0" r="4.2" fill="${VU_ORANGE}" />
      <circle cx="0" cy="0" r="1.8" fill="#ffffff" opacity="0.85" />
    </g>
  `;
}
