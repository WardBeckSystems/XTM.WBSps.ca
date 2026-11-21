/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy vintage skin: authentic McCurdy cartouche logo on the VU faces. */

export function renderMcCurdyVuBadge(cx: number, cy: number, ink: string): string {
  return `<g class="mc-only" transform="translate(${(cx - 42).toFixed(1)}, ${(cy + 34).toFixed(1)})">
              <!-- Authentic McCurdy Cartouche Box & Wordmark -->
              <rect x="0" y="0" width="84" height="28" rx="2.5"
                    fill="none" stroke="${ink}" stroke-width="1.5" stroke-opacity="0.85" />
              <text x="42" y="19"
                    font-family="'Arial Black', Helvetica, Arial, sans-serif"
                    font-size="13.5" font-weight="900" letter-spacing="-0.6" text-anchor="middle"
                    fill="none" stroke="${ink}" stroke-width="1.2" stroke-opacity="0.9">McCurdy</text>
            </g>`;
}
