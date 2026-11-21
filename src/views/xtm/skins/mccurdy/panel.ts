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

/** Black stepped bezel behind one meter window */
function bezel(cx: number): string {
  const { bx, by } = MC_BEZEL;
  const x0 = cx - MW / 2 - bx, y0 = MYc - MH / 2 - by;
  const w = MW + 2 * bx, h = MH + 2 * by;
  return `<g filter="url(#mc_shadow)">
        <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="url(#mc_bezel)" stroke="#0d0d0e" stroke-width="2"/>
        <polygon points="${x0},${y0} ${x0 + w},${y0} ${x0 + w - bx},${y0 + by} ${x0 + bx},${y0 + by}" fill="#36373a"/>
        <polygon points="${x0},${y0 + h} ${x0 + w},${y0 + h} ${x0 + w - bx},${y0 + h - by} ${x0 + bx},${y0 + h - by}" fill="#111113"/>
        <polygon points="${x0},${y0} ${x0 + bx},${y0 + by} ${x0 + bx},${y0 + h - by} ${x0},${y0 + h}" fill="#232426"/>
        <polygon points="${x0 + w},${y0} ${x0 + w - bx},${y0 + by} ${x0 + w - bx},${y0 + h - by} ${x0 + w},${y0 + h}" fill="#191a1c"/>
        <rect x="${x0 + bx}" y="${y0 + by}" width="${MW}" height="${MH}" fill="#0e0e10"/>
      </g>`;
}

/** INPUT 1 / INPUT 2 legend with hairlines between each meter pair */
function legend(cx: number, label: string, x0: number | null): string {
  const ly = VH - 26;
  return `
      ${x0 === null ? '' : `<line x1="${x0}" y1="${ly}" x2="${cx - 70}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${cx + 70}" y1="${ly}" x2="${cx + 600}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${cx}" y="${ly}" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${label}</text>`;
}

export function renderMcCurdyPanel(): string {
  const W = VW, H = VH;
  let s = `<g class="mc-only">
      ${PANEL_DEFS}
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <line x1="4" y1="3" x2="${W - 4}" y2="3" stroke="#ffffff" stroke-opacity="0.7" stroke-width="2"/>`;

  for (const cx of MX) s += bezel(cx);

  s += legend(MC_LEGENDS.input1X, 'INPUT 1', null) + legend(MC_LEGENDS.input2X, 'INPUT 2', MC_LEGENDS.input2LineX0);

  s += `</g>`;
  return s;
}
