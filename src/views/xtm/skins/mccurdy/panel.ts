/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy 19" 2U Folded Sheet Metal Faceplate:
 * - Baked enamel folded sheet metal chassis with top and bottom ventilation louver louvers.
 * - 19" EIA rackmount side mounting flanges with oval mounting slots.
 * - Multi-stage beveled meter bezels with ambient drop shadows.
 * - Sourced from wbs_mccurdy_dual_channel_19_2u_metering_panel.html specifications.
 */
import { VW, VH, MW, MH, MX, MYc } from '../../layout/wbs-layout';
import { MC_BEZEL, MC_LEGENDS } from '../../layout/mccurdy-layout';

const PANEL_DEFS = `<defs>
        <linearGradient id="mc_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e5e1d5"/><stop offset="50%" stop-color="#dedad0"/><stop offset="100%" stop-color="#d2cec2"/>
        </linearGradient>
        <linearGradient id="mc_top_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4e738a" /><stop offset="75%" stop-color="#3b5a6e" /><stop offset="100%" stop-color="#294150" />
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
        <radialGradient id="mc_screw_grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#555861"/>
          <stop offset="45%" stop-color="#2d2f35"/>
          <stop offset="85%" stop-color="#18191c"/>
          <stop offset="100%" stop-color="#0b0c0d"/>
        </radialGradient>
        <filter id="mc_shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.55"/>
        </filter>
      </defs>`;

/** Slotted black-oxide chassis mounting screw on meter bezel */
function bezelScrew(sx: number, sy: number, r = 6.2, slotAngle = 38): string {
  const rad = (slotAngle * Math.PI) / 180;
  const dx = r * 0.72 * Math.cos(rad);
  const dy = r * 0.72 * Math.sin(rad);
  return `
    <g class="mc-bezel-screw" transform="translate(${sx.toFixed(1)}, ${sy.toFixed(1)})">
      <!-- Recessed Counterbore Rim in Molded Bakelite/Bezel -->
      <circle cx="0" cy="0" r="${(r + 2.2).toFixed(1)}" fill="#090a0c" stroke="#1d1e22" stroke-width="0.8" />
      <!-- Domed Screw Head -->
      <circle cx="0" cy="0" r="${r.toFixed(1)}" fill="url(#mc_screw_grad)" stroke="#111215" stroke-width="0.8" />
      <!-- Specular Highlight Arc -->
      <path d="M ${(-r * 0.65).toFixed(1)},${(-r * 0.4).toFixed(1)} A ${(r * 0.7).toFixed(1)},${(r * 0.7).toFixed(1)} 0 0 1 ${(r * 0.5).toFixed(1)},${(-r * 0.55).toFixed(1)}" fill="none" stroke="#727680" stroke-width="0.85" stroke-linecap="round" stroke-opacity="0.8" />
      <!-- Screwdriver Slot -->
      <line x1="${(-dx).toFixed(1)}" y1="${(-dy).toFixed(1)}" x2="${dx.toFixed(1)}" y2="${dy.toFixed(1)}" stroke="#060708" stroke-width="1.8" stroke-linecap="round" />
      <line x1="${(-dx).toFixed(1)}" y1="${(-dy + 0.5).toFixed(1)}" x2="${dx.toFixed(1)}" y2="${(dy + 0.5).toFixed(1)}" stroke="#494c54" stroke-width="0.7" stroke-linecap="round" stroke-opacity="0.65" />
    </g>`;
}

/** Generates realistic perforated ventilation louvers across the folded sheet metal */
function ventSlots(w: number, y: number, h: number, count: number): string {
  let s = '';
  const startX = 140;
  const availW = w - 280;
  const slotW = availW / count;
  for (let i = 0; i < count; i++) {
    const x = startX + i * slotW;
    s += `<rect x="${(x + 4).toFixed(1)}" y="${y}" width="${(slotW - 8).toFixed(1)}" height="${h}" rx="2.5" />`;
  }
  return s;
}

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

        <!-- Four Corner Chassis Mounting Screws on Molded Bezel -->
        ${bezelScrew(x0 + 17, y0 + 14, 6.2, 42)}
        ${bezelScrew(x0 + w - 17, y0 + 14, 6.2, -35)}
        ${bezelScrew(x0 + 17, y0 + h - 14, 6.2, 28)}
        ${bezelScrew(x0 + w - 17, y0 + h - 14, 6.2, -48)}

        <!-- Bottom Center Zero-Adjust Mechanical Trimmer Screw -->
        ${bezelScrew(cx, y0 + h - 14, 8.2, 90)}
      </g>`;
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
      <line x1="56" y1="26" x2="${W - 56}" y2="26" stroke="#ffffff" stroke-opacity="0.75" stroke-width="2"/>

      <!-- Top Perforated Ventilation Cover Rim (y = 0..24) -->
      <rect class="mc-top-rim" x="0" y="0" width="${W}" height="24" fill="url(#mc_top_rim)" />
      <line x1="0" y1="23.5" x2="${W}" y2="23.5" stroke="#182832" stroke-width="1.6" />
      <line x1="0" y1="25.5" x2="${W}" y2="25.5" stroke="#628aa1" stroke-width="1.0" stroke-opacity="0.6" />
      <g class="mc-top-vents" fill="#141e26" opacity="0.85">${ventSlots(W, 5, 14, 52)}</g>

      <!-- Bottom Ventilation Louver Strip (y = H-24..H) -->
      <rect class="mc-bottom-rim" x="0" y="${H - 24}" width="${W}" height="24" fill="#202c36" />
      <line x1="0" y1="${H - 24.5}" x2="${W}" y2="${H - 24.5}" stroke="#10171d" stroke-width="1.6" />
      <g class="mc-bottom-vents" fill="#0d1318">${ventSlots(W, H - 19, 14, 52)}</g>

      <!-- 19" EIA Rackmount Side Mounting Flanges & Oval Mounting Slots -->
      <rect class="mc-rack-flange" x="0" y="0" width="56" height="${H}" fill="#18212a" />
      <rect class="mc-rack-flange" x="${W - 56}" y="0" width="56" height="${H}" fill="#18212a" />
      <line x1="56" y1="0" x2="56" y2="${H}" stroke="#53778c" stroke-width="1.2" stroke-opacity="0.55" />
      <line x1="${W - 56}" y1="0" x2="${W - 56}" y2="${H}" stroke="#53778c" stroke-width="1.2" stroke-opacity="0.55" />

      <!-- EIA Oval Rackmount Slots (Top & Bottom on each ear) -->
      <rect x="12" y="38" width="32" height="20" rx="10" fill="#0c0e12" stroke="#334654" stroke-width="1.5" />
      <rect x="12" y="${H - 58}" width="32" height="20" rx="10" fill="#0c0e12" stroke="#334654" stroke-width="1.5" />
      <rect x="${W - 44}" y="38" width="32" height="20" rx="10" fill="#0c0e12" stroke="#334654" stroke-width="1.5" />
      <rect x="${W - 44}" y="${H - 58}" width="32" height="20" rx="10" fill="#0c0e12" stroke="#334654" stroke-width="1.5" />`;

  for (const cx of MX) s += bezel(cx);

  s += legend(MC_LEGENDS.input1X, 'INPUT 1', 66) + legend(MC_LEGENDS.input2X, 'INPUT 2', MC_LEGENDS.input2LineX0);

  s += `</g>`;
  return s;
}
