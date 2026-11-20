/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Hardware Jack Panel & Model Markings:
 * - 600 ohm, 10K, 20K impedance silkscreen markings.
 * - Broadcast standard 1/4" phone jacks (INPUT, MON. OUTPUT).
 * - SA14023 model designation.
 */

export function renderMcCurdyJacks(cx = 120, cy = 200, color = '#edeae0'): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;

  const jack = (jx: number, jy: number, label: string) => `
    <g class="mccurdy-jack-item">
      <!-- 1/4" Jack Bushing & Bezel -->
      <circle cx="${jx}" cy="${jy}" r="16" fill="url(#chromeToggleGrad)" stroke="#383c42" stroke-width="1.2" />
      <circle cx="${jx}" cy="${jy}" r="11" fill="#1b1c1e" stroke="#2c3035" stroke-width="0.8" />
      <circle cx="${jx}" cy="${jy}" r="6.5" fill="#070809" />
      <text x="${jx - 26}" y="${jy + 4}" ${font} font-size="11" font-weight="700" fill="${color}" text-anchor="end">${label}</text>
    </g>`;

  return `
    <g class="mccurdy-jacks-assembly" ${font}>
      <!-- Impedance & Model Silkscreen -->
      <text x="${cx - 80}" y="${cy - 52}" font-size="12.5" font-weight="700" fill="${color}">600Ω</text>
      <text x="${cx - 80}" y="${cy}" font-size="12.5" font-weight="700" fill="${color}">10K</text>
      <text x="${cx - 80}" y="${cy + 52}" font-size="12.5" font-weight="700" fill="${color}">20K</text>

      <!-- Jack Sockets -->
      ${jack(cx, cy - 52, 'INPUT')}
      ${jack(cx, cy, '')}
      ${jack(cx, cy + 52, 'MON. OUTPUT')}

      <!-- Model Designation -->
      <text x="${cx - 80}" y="${cy + 112}" font-size="13" font-weight="800" fill="${color}" letter-spacing="1">SA14023</text>
    </g>`;
}
