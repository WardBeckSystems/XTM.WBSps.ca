/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** McCurdy vintage skin: authentic McCurdy shield logo with metallic blue background on VU faces. */

export function renderMcCurdyVuBadge(cx: number, cy: number, _ink: string): string {
  const x = cx - 42;
  const y = cy + 28;
  return `<g class="mc-only">
    <svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="84" height="39" viewBox="100 85 800 370" aria-hidden="true">
      <defs>
        <linearGradient id="mcShieldBlueVu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a5f"/>
          <stop offset="50%" stop-color="#2a5280"/>
          <stop offset="100%" stop-color="#142842"/>
        </linearGradient>
      </defs>
      <!-- Symmetrical Shield Border & Metallic Blue Field -->
      <path d="M 140,185 Q 132,160 165,155 L 475,112 Q 500,108 525,112 L 835,155 Q 868,160 860,185 L 785,375 Q 775,398 748,402 L 525,442 Q 500,446 475,442 L 252,402 Q 225,398 215,375 Z"
            fill="url(#mcShieldBlueVu)" stroke="#d9e2e8" stroke-width="24" stroke-linejoin="round"/>
      <!-- Lowercase 'm' with extended crossbar -->
      <path d="M 248,175 L 322,175 L 322,200 C 342,178 368,170 394,173 C 418,176 434,188 444,206 C 464,180 494,170 524,173 C 564,177 586,206 586,250 L 586,322 L 782,322 L 770,350 L 586,350 L 586,362 L 608,362 L 608,385 L 498,385 L 498,362 L 520,362 L 520,350 L 452,350 L 452,322 L 520,322 L 520,255 C 520,230 508,218 488,218 C 468,218 454,232 454,258 L 454,305 L 390,305 L 390,255 C 390,230 378,218 358,218 C 338,218 324,232 324,258 L 324,362 L 346,362 L 346,385 L 248,385 L 248,362 L 268,362 L 268,200 L 248,200 Z"
            fill="#f4f6f8"/>
      <!-- CCURDY Lettering -->
      <g fill="#f4f6f8" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800" letter-spacing="1.5">
        <text x="598" y="258" font-size="32">C</text>
        <text x="622" y="272" font-size="44">CURDY</text>
      </g>
    </svg>
  </g>`;
}
