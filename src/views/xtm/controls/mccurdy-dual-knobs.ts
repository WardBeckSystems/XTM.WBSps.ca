/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Dual-Knob Hardware Section (Model 023 / SA14023):
 * Integrates both:
 * 1) 31-Step Dual-Scale Main Attenuator Knob (11.25° / 2 dB per click)
 * 2) 2-Position Range Switch (-50 TO +10 and -30 TO +30)
 * Includes routed silkscreen guide lines between the range switch detents and the dual scales.
 *
 * Sourced from McCurdy Extended Range Level Meter hardware specifications.
 */

import { renderMcCurdyDualScale, renderMcCurdyAttenuatorKnob } from './mccurdy-attenuator';
import { renderMcCurdyRangeSwitch } from './mccurdy-range-switch';

export interface McCurdyDualKnobsOptions {
  mainCx?: number;
  mainCy?: number;
  rangeCx?: number;
  rangeCy?: number;
  stepIndex?: number;      // 0..30 (default 15 = 0 dB / -20 dB reference)
  isHighRange?: boolean;   // false = -50 to +10 (Outer), true = -30 to +30 (Inner)
  color?: string;
}

export function renderMcCurdyDualKnobs(options: McCurdyDualKnobsOptions = {}): string {
  const {
    mainCx = 312,
    mainCy = 96,
    rangeCx = 312,
    rangeCy = 226,
    stepIndex = 15,
    isHighRange = false,
    color = '#edeae0'
  } = options;

  // Attenuator angle: 31 detents spanning 337.5° (11.25°/step)
  // Step 15 = -90° (9 o'clock)
  const angleDeg = -258.75 + stepIndex * 11.25;

  return `
    <g class="mccurdy-dual-knobs-section" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif">
      <!-- 1. Silkscreen Dual-Concentric Scale Ring around Main Attenuator -->
      ${renderMcCurdyDualScale(mainCx, mainCy, isHighRange ? 'high' : 'low', color)}

      <!-- 2. Main 31-Step Fluted Attenuator Knob -->
      ${renderMcCurdyAttenuatorKnob(mainCx, mainCy, angleDeg)}

      <!-- 3. 2-Position Range Switch & Interconnecting Routing Lines -->
      ${renderMcCurdyRangeSwitch(rangeCx, rangeCy, isHighRange, color)}
    </g>`;
}
