/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS skin: canvas background and signature channel frames:
 * - Modern dark canvas and signature green frames for Ward-Beck.com.
 * - Broadcast petrol / slate-blue baked enamel chassis (#436478 to #2c4454) for Ward-Beck.ca,
 *   with top/bottom ventilation strips, 19" EIA rack flanges, and INPUT 1 / INPUT 2 hairline rules.
 */
import { VW, VH } from '../../layout/wbs-layout';

export const GREEN_PANEL_GRADIENT = `<linearGradient id="xgreen_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="25%" stop-color="#16a34a"/>
          <stop offset="75%" stop-color="#15803d"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>`;

export function renderWbsCanvas(): string {
  return `
    <!-- Modern Dark Canvas (Ward-Beck.com) -->
    <rect class="wbs-only wbs-dark-canvas" width="${VW}" height="${VH}" fill="#0f1114"/>

    <!-- Vintage Ward-Beck M600 Anodized Brushed Aluminum Chassis (Ward-Beck.ca) -->
    <g class="wbs-ca-only" id="wbs-ca-broadcast-chassis">
      <!-- Warm Anodized Aluminum Faceplate Base (MF-6B standard #C6C3B3) -->
      <rect width="${VW}" height="${VH}" fill="url(#aluPlate)"/>

      <!-- M600 Anodized Extruded Aluminum Top Rail Lip (MF-6B Standard) -->
      <rect x="0" y="0" width="${VW}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="18" x2="${VW}" y2="18" stroke="#8C897B" stroke-width="1.2"/>
      <line x1="0" y1="19.5" x2="${VW}" y2="19.5" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="0.8"/>

      <!-- M600 Anodized Extruded Aluminum Bottom Rail Lip -->
      <line x1="0" y1="440.5" x2="${VW}" y2="440.5" stroke="#8C897B" stroke-width="1.2"/>
      <rect x="0" y="442" width="${VW}" height="18" fill="url(#extrusionBevel)" stroke="#5C5A50" stroke-width="1"/>
      <line x1="0" y1="442" x2="${VW}" y2="442" stroke="#D4D2C5" stroke-width="1.2"/>

      <!-- Dark Engraved Ink "INPUT 1" Channel Label with Hairline Rules (#2A2B2A) -->
      <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
        <line x1="100" y1="448" x2="620" y2="448" stroke="#2A2B2A" stroke-width="1.2" stroke-opacity="0.85"/>
        <text x="687.5" y="452" font-size="15" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="2">INPUT 1</text>
        <line x1="755" y1="448" x2="1275" y2="448" stroke="#2A2B2A" stroke-width="1.2" stroke-opacity="0.85"/>
      </g>

      <!-- Dark Engraved Ink "INPUT 2" Channel Label with Hairline Rules (#2A2B2A) -->
      <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
        <line x1="1925" y1="448" x2="2445" y2="448" stroke="#2A2B2A" stroke-width="1.2" stroke-opacity="0.85"/>
        <text x="2512.5" y="452" font-size="15" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="2">INPUT 2</text>
        <line x1="2580" y1="448" x2="3100" y2="448" stroke="#2A2B2A" stroke-width="1.2" stroke-opacity="0.85"/>
      </g>
    </g>`;
}

export const CHANNEL_A_FRAME = `<path d="M 630 444 H 49 A 14 14 0 0 1 35 430 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 430 A 14 14 0 0 1 1326 444 H 745"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="687.5" y="444" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">LEFT</text>`;

export const CHANNEL_B_FRAME = `<path d="M 2455 444 H 1874 A 14 14 0 0 1 1860 430 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 430 A 14 14 0 0 1 3151 444 H 2570"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="2512.5" y="444" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">RIGHT</text>`;
