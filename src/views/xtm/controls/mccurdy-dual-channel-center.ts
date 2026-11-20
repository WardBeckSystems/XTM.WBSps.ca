/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Dual-Channel 19" 2U Center Console Section:
 * Sourced from wbs_mccurdy_dual_channel_19_2u_metering_panel.html:
 * - Folded sheet metal hairline bezel frame.
 * - 31-step dual-concentric attenuator knob with all physical details (14 flutes, grooves, yellow cap, hollow triangle pointer).
 * - Chrome bat-handle toggle switch / stick positioned directly BELOW the knob.
 * - 2-position Range switch cluster (-50 TO +10 and -30 TO +30) with guidance routing lines.
 * - Blue 1 INPUT 2 dual phone jack block.
 */

import { renderMcCurdyDualScale, renderMcCurdyAttenuatorKnob } from './mccurdy-attenuator';
import { renderMcCurdyRangeSwitch } from './mccurdy-range-switch';
import { renderMcCurdyToggleSwitch } from './mccurdy-toggle-switch';

export interface DualChannelCenterOptions {
  cx?: number;
  cy?: number;
  stepIndex?: number;      // 0..30 (default 15 = 0 dB / -20 dB reference)
  isHighRange?: boolean;   // false = -50 to +10 (Outer), true = -30 to +30 (Inner)
  toggleAngle?: number;    // -24° = MTR, 0° = CAL, +24° = MON
  color?: string;
}

export function renderMcCurdyDualChannelCenter(options: DualChannelCenterOptions = {}): string {
  const {
    cx = 760,
    cy = 130,
    stepIndex = 15,
    isHighRange = false,
    toggleAngle = -24,
    color = '#edeae0'
  } = options;

  // Left Column (Upper): 31-step detailed attenuator knob
  const knobCx = cx - 74;
  const knobCy = cy - 36;

  // Left Column (Lower): 2-Position Range Switch directly BELOW the big knob
  const rangeCx = knobCx;
  const rangeCy = knobCy + 130;

  // Right Column (Upper): Chrome bat-handle toggle switch
  const stickCx = cx + 88;
  const stickCy = cy - 36;

  // Attenuator rotor angle
  const angleDeg = -258.75 + stepIndex * 11.25;

  return `
    <g class="mccurdy-dual-channel-center" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
      <!-- Folded Sheet Metal Bezel Frame -->
      <rect x="${cx - 184}" y="${cy - 112}" width="368" height="226" rx="6" fill="none" stroke="${color}" stroke-width="0.9" stroke-opacity="0.32" />

      <!-- Silkscreen Dual-Concentric Scale around Attenuator -->
      ${renderMcCurdyDualScale(knobCx, knobCy, isHighRange ? 'high' : 'low', color)}

      <!-- 31-Step Detailed Attenuator Knob -->
      ${renderMcCurdyAttenuatorKnob(knobCx, knobCy, angleDeg)}

      <!-- 2-Position Range Switch Cluster (Positioned Directly BELOW the Big Knob) -->
      ${renderMcCurdyRangeSwitch(rangeCx, rangeCy, isHighRange, color)}

      <!-- Chrome Bat-Handle Toggle Switch / Stick (Upper Right) -->
      ${renderMcCurdyToggleSwitch({ cx: stickCx, cy: stickCy, angleDeg: toggleAngle, topLabel: 'MTR', midLabel: 'CAL', botLabel: 'MON', color })}

      <!-- Blue 1 INPUT 2 Dual Phone Jack Block (Lower Right) -->
      <g id="blue-input-jack-block" transform="translate(${cx + 18}, ${cy + 32})">
        <rect x="0" y="0" width="140" height="70" rx="5" fill="url(#blueJackPanelGrad)" stroke="#163b59" stroke-width="1.4" />
        <line x1="2" y1="1.5" x2="138" y2="1.5" stroke="#7ac0f5" stroke-width="0.9" stroke-opacity="0.7" />

        <!-- Header Labels: 1   INPUT   2 -->
        <text x="35" y="16" font-size="9.5" font-weight="700" fill="#091624" text-anchor="middle">1</text>
        <text x="70" y="16" font-size="9.2" font-weight="700" fill="#091624" text-anchor="middle" letter-spacing="0.5">INPUT</text>
        <text x="105" y="16" font-size="9.5" font-weight="700" fill="#091624" text-anchor="middle">2</text>

        <!-- Jack 1 -->
        <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer" transform="translate(35, 42)">
          <circle cx="0" cy="0" r="17" fill="url(#chromeMetalGrad)" stroke="#152636" stroke-width="1.1" />
          <circle cx="0" cy="0" r="11" fill="#1b242e" stroke="#0a121a" stroke-width="0.9" />
          <circle cx="0" cy="0" r="6" fill="#06090c" />
        </g>

        <!-- Jack 2 -->
        <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer" transform="translate(105, 42)">
          <circle cx="0" cy="0" r="17" fill="url(#chromeMetalGrad)" stroke="#152636" stroke-width="1.1" />
          <circle cx="0" cy="0" r="11" fill="#1b242e" stroke="#0a121a" stroke-width="0.9" />
          <circle cx="0" cy="0" r="6" fill="#06090c" />
        </g>
      </g>
    </g>`;
}
