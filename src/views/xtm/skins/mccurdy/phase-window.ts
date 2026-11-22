/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy skin: red LED window with 8 individual rectangular correlation phase segments (class mc-only). */
import { PHASE_LED } from '../../layout/wbs-layout';

/** Unlit / lit colour of the rectangular McCurdy phase segments */
export const MC_PHASE_OFF = '#4a1a17';
export const MC_PHASE_ON = '#ff2d1f';

export function renderMcPhaseWindow(): string {
  let segs = '';
  for (let i = 0; i < PHASE_LED.count; i++) {
    const cx = PHASE_LED.x0 + i * PHASE_LED.pitch;
    const cy = PHASE_LED.cy;
    segs += `
      <rect class="mc-only mc-com-only mc-phase-seg" id="xphase_ledr_${i}" x="${(cx - 16).toFixed(1)}" y="${(cy - 10).toFixed(1)}" width="32" height="20" rx="2.5" fill="${MC_PHASE_OFF}" stroke="#2b0d0c" stroke-width="1"/>`;
  }
  return `<g class="mc-only mc-com-only">
          <rect x="1408" y="24" width="384" height="36" rx="3" fill="#171719" stroke="#5c5952" stroke-width="1.5"/>
          <rect x="1413" y="28" width="374" height="28" fill="url(#mc_led)"/>
          ${segs}
        </g>`;
}

export const MC_PHASE_WINDOW = renderMcPhaseWindow();
