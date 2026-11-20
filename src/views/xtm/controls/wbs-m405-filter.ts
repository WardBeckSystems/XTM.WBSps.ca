/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems M405 Secondary Hardware Controls:
 * - IN / OUT toggle bat switch & FILTER designation.
 * - AC Pilot Indicator Lamp Assembly with jeweled lens and warm glow.
 * - Slotted panel mounting screws.
 */

export function renderWbsM405FilterToggle(cx: number, cy: number, isIn = true): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  const batAngle = isIn ? -28 : 28;
  const tipX = cx + (isIn ? -10 : 10);
  const tipY = cy - 19;

  return `
    <g class="wbs-filter-toggle" ${font} fill="#3a3936" text-anchor="middle">
      <text x="${cx}" y="${cy - 28}" font-size="11.5" font-weight="600" letter-spacing="0.5">IN</text>
      <!-- Mounting Hex Nut & Bushing -->
      <circle cx="${cx}" cy="${cy}" r="10.5" fill="url(#chromeToggleGrad)" stroke="#4a4e54" stroke-width="0.9" />
      <circle cx="${cx}" cy="${cy}" r="6.5" fill="#7c828a" stroke="#36393e" stroke-width="0.7" />
      <!-- Angled Metal Toggle Bat -->
      <line x1="${cx}" y1="${cy}" x2="${tipX}" y2="${tipY}" stroke="#cfd4dc" stroke-width="5.2" stroke-linecap="round" />
      <line x1="${cx}" y1="${cy}" x2="${tipX}" y2="${tipY}" stroke="#5a5f66" stroke-width="1.2" stroke-linecap="round" />
      <circle cx="${tipX}" cy="${tipY}" r="2.7" fill="#e6ebf2" />
      <text x="${cx}" y="${cy + 29}" font-size="11.5" font-weight="600" letter-spacing="0.5">OUT</text>
      <text x="${cx}" y="${cy + 46}" font-size="11.5" font-weight="600" letter-spacing="0.6">FILTER</text>
    </g>`;
}

export function renderWbsM405AcPilot(cx: number, cy: number, isPowered = true): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  return `
    <g class="wbs-ac-pilot-lamp" filter="url(#lampDropShadow)">
      <!-- Outer Bezel Ring -->
      <ellipse cx="${cx}" cy="${cy}" rx="17.5" ry="18.5" fill="url(#chromeBezelGrad)" stroke="#383c42" stroke-width="0.9" />
      <ellipse cx="${cx + 3}" cy="${cy + 1}" rx="13.5" ry="14.5" fill="#70767e" stroke="#2c3036" stroke-width="0.8" />
      <!-- Jeweled Lens (swaps between warm incandescent ON and clear OFF) -->
      <ellipse cx="${cx + 9}" cy="${cy + 4}" rx="11.5" ry="12.2"
               fill="${isPowered ? 'url(#lensOnGrad)' : 'url(#lensOffGrad)'}"
               stroke="#88909a" stroke-width="0.9" />
      <ellipse cx="${cx + 10}" cy="${cy + 4}" rx="6.2" ry="6.8" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.85" />
      <circle cx="${cx + 9}" cy="${cy + 3}" r="2.8" fill="#ffffff" fill-opacity="0.9" />
      <!-- Label -->
      <text x="${cx + 4}" y="${cy + 39}" ${font} font-size="12.5" font-weight="600" fill="#3a3936" text-anchor="middle" letter-spacing="0.6">AC</text>
    </g>`;
}

export function renderWbsSlottedScrew(cx: number, cy: number, angleDeg = 15): string {
  return `
    <g transform="translate(${cx}, ${cy}) rotate(${angleDeg})">
      <circle cx="0" cy="0" r="8" fill="#111214" stroke="#36393e" stroke-width="1" />
      <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#2c2f34" stroke-width="1.8" />
    </g>`;
}
