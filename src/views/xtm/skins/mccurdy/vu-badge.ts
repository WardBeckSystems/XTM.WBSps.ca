/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy skin: outlined McCurdy badge on the VU faces (class mc-only). */

export function renderMcCurdyVuBadge(cx: number, cy: number, ink: string): string {
  return `<g class="mc-only" transform="translate(${(cx - 70).toFixed(1)}, ${(cy + 34).toFixed(1)})">
              <rect x="0" y="0" width="140" height="34" rx="2" fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="1.8"/>
              <text x="70" y="26" text-anchor="middle" font-family="'Arial Black', Helvetica, sans-serif" font-size="24" font-weight="900" letter-spacing="-0.8" fill="none" stroke="${ink}" stroke-opacity="0.6" stroke-width="1.3">McCurdy</text>
            </g>`;
}
