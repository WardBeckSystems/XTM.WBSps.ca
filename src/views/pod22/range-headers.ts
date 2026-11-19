/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * POD-22 range legends drawn below the LED rows (nothing on top).
 * Kept verbatim so the generated SVG markup is unchanged.
 */

/** Extended range: INFINITE SILENCE / VU RANGE / PEAK RANGE / DISTORTION RANGE. */
export const EXT_RANGE_HEADERS = `
        <!-- Section 0: INFINITE SILENCE (Below -45 dBFS, added on left) -->
        <g class="pod-section-silence">
          <line x1="66" y1="182" x2="150" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
          <text x="243" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#10b981" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">INFINITE SILENCE</text>
          <line x1="336" y1="182" x2="420" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 1: VU RANGE Header (PR to 0 VU) -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 2: PEAK RANGE Header (+1 to +14) -->
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1875" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1945" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2015" y1="182" x2="2260" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 3: DISTORTION RANGE Header (+15 to PK, added on right) -->
        <g class="pod-section-distortion">
          <line x1="2276" y1="182" x2="2370" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <text x="2474" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#ef4444" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">DISTORTION RANGE</text>
          <line x1="2578" y1="182" x2="2674" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        </g>
        `;

/** Standard range: VU RANGE / PEAK RANGE. */
export const STD_RANGE_HEADERS = `
        <!-- Standard 2-Section VU & Peak Range -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1900" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1965" y="183" dominant-baseline="central" font-size="12" font-weight="900" class="p22-legend" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2030" y1="182" x2="2306" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        `;
