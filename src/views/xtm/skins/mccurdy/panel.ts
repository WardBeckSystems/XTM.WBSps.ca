/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy ATS-100 faceplate (light mode), shown only when <body class="theme-mccurdy">.
 * Meters, LEDs, VFD and ballistics are untouched; this only swaps the panel around them.
 */
import { VW, VH, MW, MH, MX, MYc } from '../../layout/wbs-layout';
import { MC_BEZEL, MC_LEGENDS } from '../../layout/mccurdy-layout';

const PANEL_DEFS = `<defs>
        <linearGradient id="mc_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e5e1d5"/><stop offset="50%" stop-color="#dedad0"/><stop offset="100%" stop-color="#d2cec2"/>
        </linearGradient>
        <!-- Authentic McCurdy PE1000-A Smooth Baked Hammertone Enamel -->
        <filter id="mccurdyEnamel" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="turbulence" baseFrequency="0.108" numOctaves="3" seed="23" result="cells" />
          <feGaussianBlur in="cells" stdDeviation="0.92" result="softCells" />
          <feDiffuseLighting in="softCells" surfaceScale="1.9" diffuseConstant="1.04" lighting-color="#ffffff" result="diff">
            <feDistantLight azimuth="225" elevation="56" />
          </feDiffuseLighting>
          <feSpecularLighting in="softCells" surfaceScale="1.4" specularConstant="0.34" specularExponent="34" lighting-color="#d4ebfc" result="spec">
            <feDistantLight azimuth="225" elevation="52" />
          </feSpecularLighting>
          <feColorMatrix in="softCells" type="matrix"
            values="0 0 0 0 0.04
                    0 0 0 0 0.16
                    0 0 0 0 0.28
                    0 0 0 0 0.22 0" result="rings" />
          <feBlend in="SourceGraphic" in2="diff" mode="multiply" result="shaded" />
          <feComposite in="rings" in2="shaded" operator="over" result="ringed" />
          <feComposite in="spec" in2="ringed" operator="arithmetic" k1="0" k2="0.48" k3="1" k4="0" />
        </filter>
        <pattern id="mc_panel_blue" width="280" height="280" patternUnits="userSpaceOnUse">
          <rect width="280" height="280" fill="#335d7c" filter="url(#mccurdyEnamel)"/>
        </pattern>
        <!-- Clear Enamel Topcoat / Lacquer Film Sheen Overlay -->
        <linearGradient id="mc_clear_film" x1="0" y1="0" x2="0.06" y2="1">
          <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.18"/>
          <stop offset="14%" stop-color="#bae6fd" stop-opacity="0.06"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="85%" stop-color="#04121e" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#04121e" stop-opacity="0.25"/>
        </linearGradient>
        <!-- Authentic McCurdy Precision Formed Chassis Top Rim (Hammered Blue Broadcast Enamel & Milled Highlight) -->
        <linearGradient id="mc_chassis_top_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#416b8a"/>
          <stop offset="30%" stop-color="#315673"/>
          <stop offset="80%" stop-color="#244259"/>
          <stop offset="100%" stop-color="#193042"/>
        </linearGradient>
        <linearGradient id="mc_chassis_shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a1622" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0a1622" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="mc_bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a2a2c"/><stop offset="100%" stop-color="#141416"/>
        </linearGradient>
        <linearGradient id="mc_blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4ba7e8"/><stop offset="100%" stop-color="#3892d4"/>
        </linearGradient>
        <radialGradient id="mc_jack" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stop-color="#070708"/><stop offset="82%" stop-color="#222326"/>
          <stop offset="94%" stop-color="#5a5c60"/><stop offset="100%" stop-color="#151618"/>
        </radialGradient>
        <filter id="mc_shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.55"/>
        </filter>
      </defs>`;

/** Black stepped bezel behind one meter window (ATS-100 console mode only) */
function bezel(cx: number): string {
  const { bx, by } = MC_BEZEL;
  const x0 = cx - MW / 2 - bx, y0 = MYc - MH / 2 - by;
  const w = MW + 2 * bx, h = MH + 2 * by;
  return `<g class="mc-com-only" filter="url(#mc_shadow)">
        <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="url(#mc_bezel)" stroke="#0d0d0e" stroke-width="2"/>
        <polygon points="${x0},${y0} ${x0 + w},${y0} ${x0 + w - bx},${y0 + by} ${x0 + bx},${y0 + by}" fill="#36373a"/>
        <polygon points="${x0},${y0 + h} ${x0 + w},${y0 + h} ${x0 + w - bx},${y0 + h - by} ${x0 + bx},${y0 + h - by}" fill="#111113"/>
        <polygon points="${x0},${y0} ${x0 + bx},${y0 + by} ${x0 + bx},${y0 + h - by} ${x0},${y0 + h}" fill="#232426"/>
        <polygon points="${x0 + w},${y0} ${x0 + w - bx},${y0 + by} ${x0 + w - bx},${y0 + h - by} ${x0 + w},${y0 + h}" fill="#191a1c"/>
        <rect x="${x0 + bx}" y="${y0 + by}" width="${MW}" height="${MH}" fill="#0e0e10"/>
      </g>`;
}

/** INPUT 1 / INPUT 2 legend with hairlines between each meter pair (ATS-100 Cream Console only) */
function legend(cx: number, label: string, x0: number | null): string {
  const ly = VH - 26;
  return `<g class="mc-com-only">
      ${x0 === null ? '' : `<line x1="${x0}" y1="${ly}" x2="${cx - 70}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${cx + 70}" y1="${ly}" x2="${cx + 600}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${cx}" y="${ly}" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${label}</text>
    </g>`;
}

export function renderMcCurdyPanel(): string {
  const W = VW, H = VH;
  let s = `<g class="mc-only">
      ${PANEL_DEFS}
      <rect class="mc-panel-bg" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <!-- Clear Film Lacquer Sheen Overlay over Hammertone -->
      <rect class="mc-only mc-ca-only" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="url(#mc_clear_film)" pointer-events="none"/>
      <line x1="4" y1="3" x2="${W - 4}" y2="3" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.8"/>`;

  for (const cx of MX) s += bezel(cx);

  s += legend(MC_LEGENDS.input1X, 'INPUT 1', null) + legend(MC_LEGENDS.input2X, 'INPUT 2', MC_LEGENDS.input2LineX0);

  // Precision Formed Chassis Top Rim in McCurdy Broadcast Blue Enamel
  s += `
      <!-- Authentic McCurdy Precision Formed Chassis Top Rim (from PE1000-A & broadcast hardware) -->
      <g class="mc-only mc-ca-only" pointer-events="none">
        <rect x="0" y="0" width="${W}" height="18" fill="url(#mc_chassis_top_rim)"/>
        <line x1="0" y1="1" x2="${W}" y2="1" stroke="rgba(215, 235, 255, 0.45)" stroke-width="1.4"/>
        <line x1="0" y1="18" x2="${W}" y2="18" stroke="#142332" stroke-width="1.6"/>
        <rect x="0" y="18" width="${W}" height="8" fill="url(#mc_chassis_shadow)"/>
      </g>`;

  s += `</g>`;
  return s;
}
