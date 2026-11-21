/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Industries Limited authentic vintage badge:
 * Directly derived from gemini-svg (13).svg and physical reference photo.
 * Features the elongated faceted hexagonal shield, authentic serif lowercase 'm',
 * serif 'cCURDY', and horizontal pill bar.
 * At small meter dial size (<160px), the micro-text 'RADIO INDUSTRIES LIMITED'
 * is omitted for crisp rendering without sub-pixel distortion.
 */

export function renderMcCurdyVuBadge(cx: number, cy: number, ink: string, isPpm = false): string {
  const bw = 88;
  const bh = 32.3; // 600:220 aspect ratio = 2.727
  const x = cx - (bw / 2);
  const y = cy + 18;
  const badgeFill = isPpm ? '#181b20' : '#f5ede3';
  const badgeStroke = isPpm ? '#cbd5e1' : '#1a1715';
  const badgeInk = isPpm ? '#f8fafc' : '#1a1715';

  return `
    <!-- McCurdy Radio Industries Authentic Vintage Dial Badge (gemini-svg (13).svg) -->
    <g class="mc-only mc-vu-brand-badge" transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
      <svg width="${bw}" height="${bh}" viewBox="0 0 600 220" aria-label="McCurdy Radio Industries">
        <defs>
          <path id="mc_badge_shape_${cx}" d="
            M 294,14
            Q 300,12.5 306,14
            L 556,48
            Q 566,49.5 562,60
            L 517,156
            Q 514,162 506,163
            L 306,204
            Q 300,205.5 294,204
            L 94,163
            Q 86,162 83,156
            L 38,60
            Q 34,49.5 44,48
            Z" />
        </defs>

        <!-- Elongated Faceted Hexagon Shield Body -->
        <use href="#mc_badge_shape_${cx}" fill="${badgeFill}" stroke="${badgeStroke}" stroke-width="3.5" />

        <!-- Authentic Lowercase Serif 'm' with Tall Stem -->
        <path fill="${badgeInk}" d="
          M 101,46
          L 139,46
          L 139,62
          C 149,49 164,43 181,43
          C 199,43 213,50 221,63
          C 231,49 246,43 263,43
          C 289,43 306,59 306,87
          L 306,156
          L 317,156
          L 317,163
          L 271,163
          L 271,156
          L 281,156
          L 281,89
          C 281,71 271,61 255,61
          C 239,61 227,72 227,91
          L 227,156
          L 238,156
          L 238,163
          L 192,163
          L 192,156
          L 202,156
          L 202,89
          C 202,71 192,61 176,61
          C 160,61 148,72 148,91
          L 148,156
          L 159,156
          L 159,163
          L 113,163
          L 113,156
          L 123,156
          L 123,54
          L 101,54
          Z" />

        <!-- Serif 'cCURDY' Letterforms -->
        <text x="323" y="84" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="33" fill="${badgeInk}">C</text>
        <text x="349" y="109" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="56" letter-spacing="1.5" fill="${badgeInk}">CURDY</text>

        <!-- Horizontal Capsule / Pill Bar Underline -->
        <path fill="${badgeInk}" d="
          M 264,118
          L 523,118
          A 11,11 0 0 1 523,140
          L 264,140
          A 11,11 0 0 1 264,118
          Z" />
        <!-- On meter dial (<160px), sub-pixel micro-text 'RADIO INDUSTRIES LIMITED' is omitted per specification for pristine edge acuity -->
      </svg>
    </g>`;
}
