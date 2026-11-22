/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** 1/4" Phone Jack Bushing & Bezel SVG renderer. */

export function renderJackSocket(
  jx: number,
  jy: number,
  label: string,
  color = '#edeae0',
  font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`
): string {
  return `
    <g class="mccurdy-jack-item">
      <!-- 1/4" Jack Bushing & Bezel -->
      <circle cx="${jx}" cy="${jy}" r="16" fill="url(#chromeToggleGrad)" stroke="#383c42" stroke-width="1.2" />
      <circle cx="${jx}" cy="${jy}" r="11" fill="#1b1c1e" stroke="#2c3035" stroke-width="0.8" />
      <circle cx="${jx}" cy="${jy}" r="6.5" fill="#070809" />
      <text x="${jx - 26}" y="${jy + 4}" ${font} font-size="11" font-weight="700" fill="${color}" text-anchor="end">${label}</text>
    </g>`;
}
