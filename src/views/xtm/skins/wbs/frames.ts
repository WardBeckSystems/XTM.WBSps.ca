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

    <!-- Vintage Broadcast Petrol / Slate-Blue Baked Enamel Chassis (Ward-Beck.ca) -->
    <g class="wbs-ca-only" id="wbs-ca-broadcast-chassis">
      <!-- Baked Enamel Faceplate -->
      <rect width="${VW}" height="${VH}" fill="url(#wbsSlateBlueGrad)"/>

      <!-- Top Perforated Ventilation Cover Rim -->
      <rect x="0" y="0" width="${VW}" height="18" fill="url(#topRimSlateBlue)"/>
      <line x1="0" y1="17.5" x2="${VW}" y2="17.5" stroke="#182832" stroke-width="1.5"/>
      <line x1="0" y1="19" x2="${VW}" y2="19" stroke="#628aa1" stroke-width="0.8" stroke-opacity="0.5"/>

      <!-- EIA Standard 19" Rack Mounting Flanges (Left & Right) -->
      <rect x="0" y="0" width="36" height="${VH}" fill="#19232b"/>
      <rect x="${VW - 36}" y="0" width="36" height="${VH}" fill="#19232b"/>
      <line x1="36" y1="0" x2="36" y2="${VH}" stroke="#53778c" stroke-width="0.9" stroke-opacity="0.5"/>
      <line x1="${VW - 36}" y1="0" x2="${VW - 36}" y2="${VH}" stroke="#53778c" stroke-width="0.9" stroke-opacity="0.5"/>
      <!-- Rackmount Oval Slots -->
      <rect x="10" y="38" width="16" height="24" rx="8" fill="#0d1014" stroke="#334654" stroke-width="1"/>
      <rect x="10" y="${VH - 62}" width="16" height="24" rx="8" fill="#0d1014" stroke="#334654" stroke-width="1"/>
      <rect x="${VW - 26}" y="38" width="16" height="24" rx="8" fill="#0d1014" stroke="#334654" stroke-width="1"/>
      <rect x="${VW - 26}" y="${VH - 62}" width="16" height="24" rx="8" fill="#0d1014" stroke="#334654" stroke-width="1"/>

      <!-- Bottom Ventilation Strip -->
      <line x1="0" y1="411" x2="${VW}" y2="411" stroke="#1b2b36" stroke-width="1.5"/>
      <rect x="0" y="412" width="${VW}" height="18" fill="#233744"/>

      <!-- Off-White Silkscreened "INPUT 1" Channel Label with Hairline Rules -->
      <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
        <line x1="100" y1="418" x2="620" y2="418" stroke="#eae6da" stroke-width="1.2" stroke-opacity="0.7"/>
        <text x="687.5" y="422" font-size="15" font-weight="700" fill="#eae6da" text-anchor="middle" letter-spacing="2">INPUT 1</text>
        <line x1="755" y1="418" x2="1275" y2="418" stroke="#eae6da" stroke-width="1.2" stroke-opacity="0.7"/>
      </g>

      <!-- Off-White Silkscreened "INPUT 2" Channel Label with Hairline Rules -->
      <g font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
        <line x1="1925" y1="418" x2="2445" y2="418" stroke="#eae6da" stroke-width="1.2" stroke-opacity="0.7"/>
        <text x="2512.5" y="422" font-size="15" font-weight="700" fill="#eae6da" text-anchor="middle" letter-spacing="2">INPUT 2</text>
        <line x1="2580" y1="418" x2="3100" y2="418" stroke="#eae6da" stroke-width="1.2" stroke-opacity="0.7"/>
      </g>
    </g>`;
}

export const CHANNEL_A_FRAME = `<path d="M 630 414 H 49 A 14 14 0 0 1 35 400 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 400 A 14 14 0 0 1 1326 414 H 745"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="687.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">LEFT</text>`;

export const CHANNEL_B_FRAME = `<path d="M 2455 414 H 1874 A 14 14 0 0 1 1860 400 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 400 A 14 14 0 0 1 3151 414 H 2570"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85" class="wbs-only wbs-frame-green"/>
      <text class="wbs-only wbs-frame-green" x="2512.5" y="414" dominant-baseline="central" font-size="18" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="3" font-family="'Arial Narrow', Arial, sans-serif">RIGHT</text>`;
