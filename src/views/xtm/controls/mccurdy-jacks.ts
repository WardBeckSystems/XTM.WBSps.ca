/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Hardware Jack Panel & Model Markings:
 * - 600 ohm, 10K, 20K impedance silkscreen markings.
 * - Broadcast standard 1/4" phone jacks (INPUT, MON. OUTPUT).
 * - SA14023 model designation.
 */

import { renderJackSocket } from './jack-socket';

export function renderMcCurdyJacks(cx = 120, cy = 200, color = '#edeae0'): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;

  return `
    <g class="mccurdy-jacks-assembly" ${font}>
      <!-- Impedance & Model Silkscreen -->
      <text x="${cx - 80}" y="${cy - 52}" font-size="12.5" font-weight="700" fill="${color}">600Ω</text>
      <text x="${cx - 80}" y="${cy}" font-size="12.5" font-weight="700" fill="${color}">10K</text>
      <text x="${cx - 80}" y="${cy + 52}" font-size="12.5" font-weight="700" fill="${color}">20K</text>

      <!-- Jack Sockets -->
      ${renderJackSocket(cx, cy - 52, 'INPUT', color, font)}
      ${renderJackSocket(cx, cy, '', color, font)}
      ${renderJackSocket(cx, cy + 52, 'MON. OUTPUT', color, font)}
    </g>`;
}
