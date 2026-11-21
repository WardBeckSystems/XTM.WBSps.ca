/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy ATS-100 / Dual-Channel centre section:
 * - 31-step dual-concentric attenuator knob matching McCurdy SA14023 Model 023:
 *   slate blue circular background, outer scale -50 to +10 (yellow -20 at 9 o'clock),
 *   inner scale -30 to +30 (slate blue #94a3b8), radial ticks, silver skirt with
 *   black pointer at 9 o'clock, 14 scalloped barrel flutes, and gold center cap with
 *   radial black pointer line.
 * - Red 2-digit RANGE window with UP/DOWN buttons.
 * - Blue 1 INPUT 2 box with MODE/SOURCE phone jacks.
 */
import { MC_WIN } from '../../layout/mccurdy-layout';

/** Helper to generate 14-flute scalloped path */
function buildFlutedPath(baseR: number, fluteDepth: number, count: number): string {
  const samples = count * 16;
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const theta = (i / samples) * Math.PI * 2 - Math.PI / 2;
    const r = baseR + fluteDepth * Math.cos(count * (theta + Math.PI / 2));
    const x = (r * Math.cos(theta)).toFixed(2);
    const y = (r * Math.sin(theta)).toFixed(2);
    d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
  }
  return d + ' Z';
}

export function renderMcCurdyCenter(): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700"`;
  const W = MC_WIN;

  // Knob center at x=1520, y=215 (matching console left cassette quadrant)
  const kx = 1520, ky = 215;

  // Render 31-step dual-concentric scale
  let scaleTicks = '';
  let scaleInnerNums = '';
  let scaleOuterNums = '';

  for (let i = 0; i <= 30; i++) {
    // 31 steps spanning 337.5°, 11.25° per step. Step 15 = 180° (9 o'clock)
    const deg = 180 + (i - 15) * 11.25;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const outVal = -50 + i * 2;
    const inVal = (i - 15) * 2;

    const outStr = (outVal > 0 ? '+' : '') + outVal;
    const inStr = (inVal > 0 ? '+' : '') + inVal;

    // Tick lines (r=66 to r=74)
    const x1 = (kx + 66 * cos).toFixed(1);
    const y1 = (ky + 66 * sin).toFixed(1);
    const x2 = (kx + 75 * cos).toFixed(1);
    const y2 = (ky + 75 * sin).toFixed(1);
    const isMajor = (i % 5 === 0);
    scaleTicks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="${isMajor ? '1.8' : '1.1'}" stroke-opacity="${isMajor ? '0.95' : '0.75'}"/>`;

    // Inner Scale Numbers (r=86)
    const inX = (kx + 86 * cos).toFixed(1);
    const inY = (ky + 86 * sin + 3.5).toFixed(1);
    scaleInnerNums += `<text x="${inX}" y="${inY}" font-size="${Math.abs(inVal) >= 10 ? '8.5' : '9.5'}" fill="#94a3b8" text-anchor="middle">${inStr}</text>`;

    // Outer Scale Numbers (r=104)
    const outX = (kx + 104 * cos).toFixed(1);
    const outY = (ky + 104 * sin + 3.5).toFixed(1);
    const isYellow20 = (i === 15);
    const outColor = isYellow20 ? '#fbbf24' : '#ffffff';
    scaleOuterNums += `<text x="${outX}" y="${outY}" font-size="${Math.abs(outVal) >= 10 ? '9' : '10'}" font-weight="${isYellow20 ? '800' : '700'}" fill="${outColor}" text-anchor="middle">${outStr}</text>`;
  }

  // 14 Flute barrel
  const fluteD = buildFlutedPath(40, 2.2, 14);
  let grooves = '';
  for (let g = 0; g < 14; g++) {
    const angle = (g * 360) / 14 + 360 / 28;
    const rad = (angle * Math.PI) / 180;
    grooves += `<line x1="${(35 * Math.cos(rad)).toFixed(2)}" y1="${(35 * Math.sin(rad)).toFixed(2)}" x2="${(40 * Math.cos(rad)).toFixed(2)}" y2="${(40 * Math.sin(rad)).toFixed(2)}"/>`;
  }

  return `<g class="mc-only">
      <defs>
        <linearGradient id="mc_led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#221011"/><stop offset="50%" stop-color="#36181a"/><stop offset="100%" stop-color="#1e0d0e"/>
        </linearGradient>
        <linearGradient id="mc_dial_slate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d5366"/><stop offset="50%" stop-color="#314353"/><stop offset="100%" stop-color="#24333f"/>
        </linearGradient>
        <linearGradient id="mc_skirt_silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d4d8df"/><stop offset="50%" stop-color="#b6bbc4"/><stop offset="100%" stop-color="#9399a3"/>
        </linearGradient>
        <linearGradient id="mc_barrel_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b0b5be"/><stop offset="100%" stop-color="#888e99"/>
        </linearGradient>
        <linearGradient id="mc_gold_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d97706"/><stop offset="50%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="mc_gold_face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbbf24"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <filter id="mc_redglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="mc_knob_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Center Console Bay Outline / Bezel in McCurdy Slate Finish -->
      <rect x="1350" y="16" width="500" height="428" rx="8" fill="none" stroke="#252d3a" stroke-width="2.5"/>

      <!-- ================================================================= -->
      <!-- LEFT SECTION: MCCURDY 31-STEP DUAL-CONCENTRIC ATTENUATOR KNOB     -->
      <!-- ================================================================= -->
      <g id="mccurdy-vintage-knob-assembly" class="xtm-btn mccurdy-knob" filter="url(#mc_knob_shadow)" style="cursor:grab; touch-action:none; user-select:none;">
        <title>McCurdy SA14023 Dual-Concentric Attenuator (-50 to +10 dB / -30 to +30 dB)</title>

        <!-- Circular Slate Blue Background Plate (r=122) -->
        <circle cx="${kx}" cy="${ky}" r="122" fill="url(#mc_dial_slate)" stroke="#1a2530" stroke-width="2"/>
        <circle cx="${kx}" cy="${ky}" r="120" fill="none" stroke="#5a7690" stroke-width="0.8" stroke-opacity="0.5"/>

        <!-- Silkscreen Scales Group -->
        <g id="mc-knob-scales" ${font}>
          ${scaleTicks}
          ${scaleInnerNums}
          ${scaleOuterNums}
        </g>

        <!-- Silver Skirt Base Disc (r=58) with Black Pointer Arrow pointing at 9 o'clock -->
        <circle cx="${kx}" cy="${ky}" r="58" fill="url(#mc_skirt_silver)" stroke="#686e7a" stroke-width="1.2"/>
        <circle cx="${kx}" cy="${ky}" r="45" fill="none" stroke="#8a909c" stroke-width="0.9"/>
        <!-- Solid Black Pointer Arrow at 9 o'clock (-58px from center) -->
        <polygon points="${kx - 57},${ky} ${kx - 44},${ky - 7.5} ${kx - 44},${ky + 7.5}" fill="#141517"/>

        <!-- 14-Flute Barrel Body (r=40) -->
        <g transform="translate(${kx}, ${ky})">
          <path d="${fluteD}" fill="url(#mc_barrel_grad)" stroke="#555a64" stroke-width="1.1"/>
          <g stroke="#666c77" stroke-width="0.9" stroke-linecap="round">
            ${grooves}
          </g>

          <!-- Raised Gold Bezel Ring (r=33) & Highlight -->
          <circle cx="0" cy="0" r="33" fill="url(#mc_gold_rim)" stroke="#78350f" stroke-width="1"/>
          <path d="M -24,-22 A 32,32 0 0 1 24,-22" fill="none" stroke="#fde68a" stroke-width="1.2" stroke-opacity="0.85"/>

          <!-- Textured Gold Cap Face (r=29) -->
          <circle cx="0" cy="0" r="29" fill="url(#mc_gold_face)" stroke="#92400e" stroke-width="0.9"/>

          <!-- Solid Black Radial Pointer Line to 9 o'clock -->
          <line x1="0" y1="0" x2="-28" y2="0" stroke="#161719" stroke-width="3.2" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- RIGHT SECTION: RANGE DISPLAY & INPUT JACKS (MODE / SOURCE)        -->
      <!-- ================================================================= -->
      <!-- RANGE section: rounded border around the LED window and UP/DOWN buttons -->
      <rect class="mc-range-box" x="1670" y="66" width="164" height="175" rx="12" fill="#e9e5da" stroke="#232325" stroke-width="2.5"/>
      <!-- RANGE LED window -->
      <rect x="1700" y="${W.y - 4}" width="${W.w + 8}" height="${W.h + 8}" rx="3" fill="#1b1c1e"/>
      <rect x="1704" y="${W.y}" width="${W.w}" height="${W.h}" rx="2" fill="url(#mc_led)"/>
      <g id="xmc_digits" filter="url(#mc_redglow)" transform="translate(104, 0)"></g>
      <text class="mc-range-text" x="1752" y="${W.y + W.h + 22}" text-anchor="middle" ${font} font-size="15" letter-spacing="0.6" fill="#232325">RANGE</text>
      <!-- UP / DOWN arrows either side of the moved buttons -->
      <path class="mc-range-arrow" d="M1686 226 V198 M1679 208 L1686 196 L1693 208" stroke="#232325" stroke-width="2.5" fill="none"/>
      <path class="mc-range-arrow" d="M1818 196 V224 M1811 214 L1818 226 L1825 214" stroke="#232325" stroke-width="2.5" fill="none"/>

      <!-- 1 INPUT 2 box: the two jacks ARE the input buttons here (1 = MODE, 2 = SOURCE) -->
      <rect class="mc-input-box" x="1666" y="260" width="172" height="150" rx="8" fill="url(#mc_blue)" stroke="#1b1c1e" stroke-width="2.2"/>
      <text class="mc-input-text" x="1704" y="286" text-anchor="middle" ${font} font-size="15" fill="#181b1e">1</text>
      <text class="mc-input-text" x="1752" y="286" text-anchor="middle" ${font} font-size="14" fill="#181b1e">INPUT</text>
      <text class="mc-input-text" x="1800" y="286" text-anchor="middle" ${font} font-size="15" fill="#181b1e">2</text>
      <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer">
        <title>Input 1 (MODE)</title>
        <circle cx="1704" cy="340" r="24" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
      <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer">
        <title>Input 2 (SOURCE)</title>
        <circle cx="1800" cy="340" r="24" fill="url(#mc_jack)" stroke="#1b1c1e" stroke-width="2"/>
      </g>
    </g>`;
}
