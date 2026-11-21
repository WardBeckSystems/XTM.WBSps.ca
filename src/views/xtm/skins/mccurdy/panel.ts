/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Folded Sheet Metal Faceplate:
 * - Baked enamel folded sheet metal chassis with top and bottom ventilation louvers.
 * - Flush meter windows (no bezels, no rack mounts).
 * - Sourced from wbs_mccurdy_dual_channel_19_2u_metering_panel.html and mccurdy-ats-2v2.svg specifications.
 */
import { VW, VH } from '../../layout/wbs-layout';
import { MC_LEGENDS } from '../../layout/mccurdy-layout';

const PANEL_DEFS = `<defs>
        <linearGradient id="mc_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e5e1d5"/><stop offset="50%" stop-color="#dedad0"/><stop offset="100%" stop-color="#d2cec2"/>
        </linearGradient>
        <linearGradient id="mc_top_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4e738a" /><stop offset="75%" stop-color="#3b5a6e" /><stop offset="100%" stop-color="#294150" />
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

/** Generates realistic perforated ventilation louvers across the folded sheet metal */
function ventSlots(w: number, y: number, h: number, count: number): string {
  let s = '';
  const startX = 36;
  const availW = w - 72;
  const slotW = availW / count;
  for (let i = 0; i < count; i++) {
    const x = startX + i * slotW;
    s += `<rect x="${(x + 4).toFixed(1)}" y="${y}" width="${(slotW - 8).toFixed(1)}" height="${h}" rx="2.5" />`;
  }
  return s;
}

/** INPUT 1 / INPUT 2 legend with hairlines between each meter pair */
function legend(cx: number, label: string, x0: number | null): string {
  const ly = VH - 38;
  return `
      ${x0 === null ? '' : `<line x1="${x0}" y1="${ly}" x2="${cx - 70}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>`}
      <line x1="${cx + 70}" y1="${ly}" x2="${cx + 600}" y2="${ly}" stroke="#5c5952" stroke-width="1.5"/>
      <text x="${cx}" y="${ly}" dominant-baseline="central" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" letter-spacing="2" fill="#636058">${label}</text>`;
}

export function renderMcCurdyPanel(): string {
  const W = VW, H = VH;
  let s = `<g class="mc-only">
      ${PANEL_DEFS}

      <!-- Main Folded Sheet Metal Faceplate -->
      <rect class="mc-panel-bg" x="0" y="24" width="${W}" height="${H - 48}" fill="url(#mc_panel)" stroke="#b5b1a6" stroke-width="2"/>
      <line x1="0" y1="26" x2="${W}" y2="26" stroke="#ffffff" stroke-opacity="0.75" stroke-width="2"/>

      <!-- Top Perforated Ventilation Cover Rim (y = 0..24) -->
      <rect class="mc-top-rim" x="0" y="0" width="${W}" height="24" fill="url(#mc_top_rim)" />
      <line x1="0" y1="23.5" x2="${W}" y2="23.5" stroke="#182832" stroke-width="1.6" />
      <line x1="0" y1="25.5" x2="${W}" y2="25.5" stroke="#628aa1" stroke-width="1.0" stroke-opacity="0.6" />
      <g class="mc-top-vents" fill="#141e26" opacity="0.85">${ventSlots(W, 5, 14, 56)}</g>

      <!-- Bottom Ventilation Louver Strip (y = H-24..H) -->
      <rect class="mc-bottom-rim" x="0" y="${H - 24}" width="${W}" height="24" fill="#202c36" />
      <line x1="0" y1="${H - 24.5}" x2="${W}" y2="${H - 24.5}" stroke="#10171d" stroke-width="1.6" />
      <g class="mc-bottom-vents" fill="#0d1318">${ventSlots(W, H - 19, 14, 56)}</g>

      <!-- Authentic McCurdy Brand Cartouche & Model Title on Panel Face -->
      <g class="mc-panel-brand" transform="translate(48, 375)">
        <rect x="0" y="0" width="112" height="34" rx="3" fill="none" stroke="#7a766d" stroke-width="1.4" />
        <text x="56" y="23" font-family="'Arial Black', Helvetica, Arial, sans-serif" font-size="16" font-weight="900" letter-spacing="-0.6" text-anchor="middle" fill="none" stroke="#68655d" stroke-width="1.3">McCurdy</text>
        <text x="126" y="23" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="1.2" fill="#68655d">MODEL ATS-100</text>
      </g>`;

  s += legend(MC_LEGENDS.input1X, 'INPUT 1', 320) + legend(MC_LEGENDS.input2X, 'INPUT 2', MC_LEGENDS.input2LineX0);

  s += `</g>`;
  return s;
}
