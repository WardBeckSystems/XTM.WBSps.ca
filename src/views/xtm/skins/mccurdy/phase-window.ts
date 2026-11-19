/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy skin: single red LED window behind the phase segments (class mc-only). */

export const MC_PHASE_WINDOW = `<g class="mc-only">
          <rect x="1408" y="24" width="384" height="36" rx="3" fill="#171719" stroke="#5c5952" stroke-width="1.5"/>
          <rect x="1413" y="28" width="374" height="28" fill="url(#mc_led)"/>
        </g>`;

/** Unlit / lit colour of the rectangular McCurdy phase segments */
export const MC_PHASE_OFF = '#4a1a17';
export const MC_PHASE_ON = '#ff2d1f';
