/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy ATS-100 centre section: red 2-digit RANGE window, UP/DOWN under it,
 * MODE/SOURCE in their own blue INPUT box. The real buttons are moved there by CSS
 * transforms (see .theme-mccurdy #xtm_btn_* in css/xtm.css), so they keep working.
 */
import { MC_WIN } from '../../layout/mccurdy-layout';

/** LED window gradient, shared with the phase LED window */
const MC_LED_GRADIENT = `<linearGradient id="mc_led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#221011"/><stop offset="50%" stop-color="#36181a"/><stop offset="100%" stop-color="#1e0d0e"/>
        </linearGradient>`;

export function renderMcCurdyCenter(): string {
  const font = `font-family="Helvetica, Arial, sans-serif" font-weight="700"`;
  const W = MC_WIN;
  return `<g class="mc-only">
      <defs>
        ${MC_LED_GRADIENT}
        <filter id="mc_redglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- RANGE section: rounded border around the LED window and UP/DOWN buttons -->
      <rect x="1494" y="66" width="212" height="200" rx="14" fill="#e9e5da" stroke="#232325" stroke-width="3"/>
      <!-- RANGE LED window -->
      <rect x="${W.x - 4}" y="${W.y - 4}" width="${W.w + 8}" height="${W.h + 8}" rx="3" fill="#1b1c1e"/>
      <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="2" fill="url(#mc_led)"/>
      <g id="xmc_digits" filter="url(#mc_redglow)"></g>
      <text x="1600" y="${W.y + W.h + 22}" text-anchor="middle" ${font} font-size="17" letter-spacing="0.6" fill="#232325">RANGE</text>
      <!-- UP / DOWN arrows either side of the moved buttons -->
      <path d="M1522 248 V214 M1514 224 L1522 212 L1530 224" stroke="#232325" stroke-width="3" fill="none"/>
      <path d="M1678 212 V246 M1670 236 L1678 248 L1686 236" stroke="#232325" stroke-width="3" fill="none"/>
      <!-- 1 INPUT 2 box: the two jacks ARE the input buttons here (1 = MODE, 2 = SOURCE) -->
      <rect x="1430" y="274" width="340" height="120" rx="8" fill="url(#mc_blue)" stroke="#1b1c1e" stroke-width="2.5"/>
      <text x="1530" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">1</text>
      <text x="1600" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">INPUT</text>
      <text x="1670" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">2</text>
      <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer">
        <title>Input 1 (MODE)</title>
        <circle cx="1530" cy="346" r="27" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
      <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer">
        <title>Input 2 (SOURCE)</title>
        <circle cx="1670" cy="346" r="27" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
    </g>`;
}
