/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy vintage skin: classic McCurdy shield crest cartouche on the VU faces. */

export function renderMcCurdyVuBadge(cx: number, cy: number, ink: string): string {
  return `<g class="mc-only" transform="translate(${(cx - 46).toFixed(1)}, ${(cy + 34).toFixed(1)})">
              <!-- Classic McCurdy Shield Crest -->
              <path d="M 4,6 L 46,2 L 88,6 L 84,22 L 46,27 L 8,22 Z"
                    fill="none" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" opacity="0.85" />
              <text x="46" y="18.5"
                    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
                    font-size="11.5" font-weight="800" fill="${ink}" opacity="0.9" text-anchor="middle" letter-spacing="0.7">McCURDY</text>
            </g>`;
}
