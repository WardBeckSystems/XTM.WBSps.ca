/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Vintage Chrome Bat-Handle Toggle Stick Switch:
 * - Chrome hex nut, circular bushing, and chamfer ring.
 * - Solid chrome tapered bat-handle lever stick with tip highlight.
 * - Positional silkscreen labels (e.g. MTR / CAL / MON or IN / OUT).
 * - Sourced from McCurdy SA14023 Extended Range Meter specifications.
 */

export interface McCurdyToggleOptions {
  cx?: number;
  cy?: number;
  angleDeg?: number;      // -24° = UP/LEFT (MTR), 0° = CENTER (CAL), +24° = DOWN/RIGHT (MON)
  topLabel?: string;
  midLabel?: string;
  botLabel?: string;
  color?: string;
}

export function renderMcCurdyToggleSwitch(options: McCurdyToggleOptions = {}): string {
  const {
    cx = 0,
    cy = 0,
    angleDeg = -24,
    topLabel = 'MTR',
    midLabel = 'CAL',
    botLabel = 'MON',
    color = '#edeae0'
  } = options;

  return `
    <g class="mccurdy-toggle-switch-stick" transform="translate(${cx}, ${cy})" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700">
      <!-- Top / Mid / Bottom Silkscreen Labels -->
      ${topLabel ? `<text x="0" y="-32" font-size="8.5" fill="${color}" text-anchor="middle" letter-spacing="0.4">${topLabel}</text>` : ''}
      ${midLabel ? `<text x="14" y="3" font-size="7.5" fill="${color}" fill-opacity="0.65" text-anchor="start" letter-spacing="0.3">${midLabel}</text>` : ''}
      ${botLabel ? `<text x="0" y="34" font-size="8.5" fill="${color}" text-anchor="middle" letter-spacing="0.4">${botLabel}</text>` : ''}

      <!-- Chrome Hex Bushing & Mounting Nut -->
      <polygon points="0,-10 8.6,-5 8.6,5 0,10 -8.6,5 -8.6,-5" fill="url(#chromeMetalGrad)" stroke="#1a252f" stroke-width="1.1" />
      <circle cx="0" cy="0" r="7.5" fill="url(#chromeMetalGrad)" stroke="#1a252f" stroke-width="0.9" />
      <circle cx="0" cy="0" r="4.5" fill="#4a525d" stroke="#1f2328" stroke-width="0.8" />

      <!-- Chrome Bat-Handle Lever Stick -->
      <g transform="rotate(${angleDeg.toFixed(1)})">
        <!-- Drop Shadow / Ambient Occlusion under Lever -->
        <line x1="1" y1="1" x2="1" y2="-21" stroke="#0f171e" stroke-width="4.8" stroke-linecap="round" opacity="0.6" />
        <!-- Main Chrome Tapered Shaft -->
        <line x1="0" y1="0" x2="0" y2="-20" stroke="#dce1e8" stroke-width="4.5" stroke-linecap="round" />
        <!-- Central Specular Highlight Core -->
        <line x1="0" y1="0" x2="0" y2="-20" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.85" />
        <!-- Dark Chamfer Edge Accent -->
        <line x1="-1.6" y1="0" x2="-1.6" y2="-19" stroke="#5a6068" stroke-width="0.8" stroke-linecap="round" />
        <!-- Chrome Ball Tip -->
        <circle cx="0" cy="-20" r="2.8" fill="#f8fafc" stroke="#6b7280" stroke-width="0.6" />
      </g>
    </g>`;
}
