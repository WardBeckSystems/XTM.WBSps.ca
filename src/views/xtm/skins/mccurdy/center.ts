/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Centre Console Sections:
 * 1. McCurdyRadio.com (ATS-100 Cream Console):
 *    - Authentic red 2-digit LED RANGE window (xmc_digits)
 *    - UP / DOWN arrows
 *    - Blue 1 INPUT 2 box with phone jacks (Input 1 = MODE, Input 2 = SOURCE)
 * 2. McCurdyRadio.ca (Studio Broadcast All-Blue Panel):
 *    - 31-step dual-concentric attenuator knob matching McCurdy SA14023 Model 023
 *      with outer scale (-50 to +10, yellow -20 at 9 o'clock), inner scale (-30 to +30),
 *      radial ticks, silver skirt with black pointer, 14 scalloped barrel flutes, and gold center cap
 *    - Bat-handle toggle switch (MTR / CAL / MON)
 *    - Blue 1 INPUT 2 phone jack block
 *    - NO red digital RANGE digits (reserved strictly for .com ATS-100 look)
 */
import { MC_WIN } from '../../layout/mccurdy-layout';

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

/** 1. McCurdyRadio.com (ATS-100 Cream Console - Reverted to authentic style before) */
export function renderMcCurdyComCenter(): string {
  const font = `font-family="Helvetica, Arial, sans-serif" font-weight="700"`;
  const W = MC_WIN;

  return `<g class="mc-com-only">
      <defs>
        <linearGradient id="mc_led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#221011"/><stop offset="50%" stop-color="#36181a"/><stop offset="100%" stop-color="#1e0d0e"/>
        </linearGradient>
        <filter id="mc_redglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- RANGE section: rounded border around the LED window and UP/DOWN buttons -->
      <rect class="mc-range-box" x="1494" y="66" width="212" height="200" rx="14" fill="#e9e5da" stroke="#232325" stroke-width="3"/>
      <!-- RANGE LED window -->
      <rect x="${W.x - 4}" y="${W.y - 4}" width="${W.w + 8}" height="${W.h + 8}" rx="3" fill="#1b1c1e"/>
      <rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="2" fill="url(#mc_led)"/>
      <g id="xmc_digits" filter="url(#mc_redglow)"></g>
      <text class="mc-range-text" x="1600" y="${W.y + W.h + 22}" text-anchor="middle" ${font} font-size="17" letter-spacing="0.6" fill="#232325">RANGE</text>
      <!-- UP / DOWN arrows either side of the moved buttons -->
      <path class="mc-range-arrow" d="M1522 248 V214 M1514 224 L1522 212 L1530 224" stroke="#232325" stroke-width="3" fill="none"/>
      <path class="mc-range-arrow" d="M1678 212 V246 M1670 236 L1678 248 L1686 236" stroke="#232325" stroke-width="3" fill="none"/>
      <!-- 1 INPUT 2 box: the two jacks ARE the input buttons here (1 = MODE, 2 = SOURCE) -->
      <rect class="mc-input-box" x="1430" y="274" width="340" height="120" rx="8" fill="url(#mc_blue)" stroke="#1b1c1e" stroke-width="2.5"/>
      <text class="mc-input-text" x="1530" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">1</text>
      <text class="mc-input-text" x="1600" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">INPUT</text>
      <text class="mc-input-text" x="1670" y="300" text-anchor="middle" ${font} font-size="17" fill="#181b1e">2</text>
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

/** 2. McCurdyRadio.ca (Studio Broadcast All-Blue Panel with Dual-Concentric Attenuator Knob) */
export function renderMcCurdyCaCenter(): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700"`;

  // Knob center at x=1530, y=215
  const kx = 1530, ky = 215;

  let scaleTicks = '';
  let scaleInnerNums = '';
  let scaleOuterNums = '';

  for (let i = 0; i <= 30; i++) {
    const deg = 180 + (i - 15) * 11.25;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const outVal = -50 + i * 2;
    const inVal = (i - 15) * 2;

    const outStr = (outVal > 0 ? '+' : '') + outVal;
    const inStr = (inVal > 0 ? '+' : '') + inVal;

    // Tick lines (r=66 to r=75)
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

  const fluteD = buildFlutedPath(40, 2.2, 14);
  let grooves = '';
  for (let g = 0; g < 14; g++) {
    const angle = (g * 360) / 14 + 360 / 28;
    const rad = (angle * Math.PI) / 180;
    grooves += `<line x1="${(35 * Math.cos(rad)).toFixed(2)}" y1="${(35 * Math.sin(rad)).toFixed(2)}" x2="${(40 * Math.cos(rad)).toFixed(2)}" y2="${(40 * Math.sin(rad)).toFixed(2)}"/>`;
  }

  return `<g class="mc-ca-only">
      <defs>
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
        <linearGradient id="mc_toggle_stick" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/>
        </linearGradient>
        <filter id="mc_knob_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Center Console Bay Outline / Bezel in McCurdy Slate Finish -->
      <rect x="1350" y="16" width="500" height="428" rx="8" fill="url(#mc_panel_blue)" stroke="#4d687f" stroke-width="2.5"/>

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
      <!-- RIGHT SECTION: TOGGLE SWITCH (UPPER) & PHONE JACKS (LOWER)        -->
      <!-- NO RED DIGITAL RANGE DIGITS - EXCLUSIVE TO .COM ATS-100           -->
      <!-- ================================================================= -->
      <!-- Chrome Bat-Handle Toggle Switch Assembly (Upper Right, cx=1730, cy=140) -->
      <g id="mc-toggle-assembly" transform="translate(1730, 140)">
        <text x="0" y="-46" ${font} font-size="11" fill="#cbd5e1" text-anchor="middle">MTR</text>
        <text x="0" y="-34" ${font} font-size="10" fill="#94a3b8" text-anchor="middle">CAL</text>
        <text x="0" y="52" ${font} font-size="11" fill="#cbd5e1" text-anchor="middle">MON</text>

        <!-- Chrome Bezel Nut -->
        <circle cx="0" cy="0" r="24" fill="url(#chromeMetalGrad)" stroke="#1a2530" stroke-width="1.4"/>
        <circle cx="0" cy="0" r="17" fill="#141c24" stroke="#0a121a" stroke-width="1"/>

        <!-- Bat Handle Stick (Angled Upwards to MTR) -->
        <g transform="rotate(-24)">
          <path d="M -4,0 L -5,-36 C -5,-42 5,-42 5,-36 L 4,0 Z" fill="url(#mc_toggle_stick)" stroke="#334155" stroke-width="0.8"/>
          <circle cx="0" cy="-38" r="6" fill="#f1f5f9"/>
        </g>
      </g>

      <!-- Blue 1 INPUT 2 Phone Jack Block (Lower Right, x=1665, y=274) -->
      <g id="mc-ca-jack-block" transform="translate(1665, 274)">
        <rect x="0" y="0" width="140" height="110" rx="8" fill="url(#mc_blue)" stroke="#163b59" stroke-width="2"/>
        <line x1="2" y1="2" x2="138" y2="2" stroke="#7ac0f5" stroke-width="1" stroke-opacity="0.8"/>

        <!-- Header Labels: 1   INPUT   2 -->
        <text x="35" y="24" ${font} font-size="13" fill="#091624" text-anchor="middle">1</text>
        <text x="70" y="24" ${font} font-size="12" fill="#091624" text-anchor="middle" letter-spacing="0.5">INPUT</text>
        <text x="105" y="24" ${font} font-size="13" fill="#091624" text-anchor="middle">2</text>

        <!-- Jack 1 (MODE) -->
        <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer" transform="translate(35, 62)">
          <title>Input 1 (MODE)</title>
          <circle cx="0" cy="0" r="22" fill="url(#mc_jack)" stroke="#152636" stroke-width="1.4"/>
          <circle cx="0" cy="0" r="14" fill="#1b242e" stroke="#0a121a" stroke-width="1"/>
          <circle cx="0" cy="0" r="7" fill="#06090c"/>
        </g>

        <!-- Jack 2 (SOURCE) -->
        <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer" transform="translate(105, 62)">
          <title>Input 2 (SOURCE)</title>
          <circle cx="0" cy="0" r="22" fill="url(#mc_jack)" stroke="#152636" stroke-width="1.4"/>
          <circle cx="0" cy="0" r="14" fill="#1b242e" stroke="#0a121a" stroke-width="1"/>
          <circle cx="0" cy="0" r="7" fill="#06090c"/>
        </g>
      </g>
    </g>`;
}

export function renderMcCurdyCenter(): string {
  return renderMcCurdyComCenter() + renderMcCurdyCaCenter();
}
