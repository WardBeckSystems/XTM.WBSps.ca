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

/** 2. McCurdyRadio.ca (Studio Broadcast All-Blue Panel with Authentic 2 RU Full-Height Attenuator) */
export function renderMcCurdyCaCenter(): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;

  // Centered at cassette center: kx = 1580, ky = 215
  // Fills full 2 RU panel height (y: 16 to 414, available height 398 px)
  const kx = 1580, ky = 215;

  let scaleTicks = '';
  let scaleInnerNums = '';
  let scaleOuterNums = '';

  // 31 steps spanning 270° clockwise from 135° (4:30) to 405° = 45° (1:30)
  // Step 0:  135° (4:30)  -> Outer: -50, Inner: -30
  // Step 5:  180° (6:00)  -> Outer: -40, Inner: -20
  // Step 15: 270° (9:00)  -> Outer: -20, Inner: 0 (Horizontal Left)
  // Step 25: 360° (12:00) -> Outer: 0,   Inner: +20 (Center Top)
  // Step 30: 405° (1:30)  -> Outer: +10, Inner: +30
  const rOuterNum = 172;
  const rTickOut = 158;
  const rTickInMajor = 142;
  const rTickInMinor = 146;
  const rInnerNum = 126;

  for (let i = 0; i <= 30; i++) {
    const clockDeg = 135 + i * 9;
    const rad = (clockDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const outVal = -50 + i * 2;
    const inVal = -30 + i * 2;

    const outStr = (outVal > 0 ? '+' : '') + outVal;
    const inStr = (inVal > 0 ? '+' : '') + inVal;

    const isMajor = (i % 5 === 0);
    const rIn = isMajor ? rTickInMajor : rTickInMinor;

    // Radial Ticks (pointing from center outward)
    const x1 = (kx + rIn * sin).toFixed(1);
    const y1 = (ky - rIn * cos).toFixed(1);
    const x2 = (kx + rTickOut * sin).toFixed(1);
    const y2 = (ky - rTickOut * cos).toFixed(1);

    scaleTicks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="${isMajor ? '2.2' : '1.3'}" stroke-opacity="${isMajor ? '0.95' : '0.8'}"/>`;

    // Inner Scale Numbers (r=126)
    const inX = (kx + rInnerNum * sin).toFixed(1);
    const inY = (ky - rInnerNum * cos + 3.8).toFixed(1);
    scaleInnerNums += `<text x="${inX}" y="${inY}" font-size="${Math.abs(inVal) >= 10 ? '10.5' : '11.5'}" font-weight="700" fill="#cbd5e1" text-anchor="middle">${inStr}</text>`;

    // Outer Scale Numbers (r=172, full vertical height spanning from y=43 to y=387!)
    const outX = (kx + rOuterNum * sin).toFixed(1);
    const outY = (ky - rOuterNum * cos + 4.2).toFixed(1);
    scaleOuterNums += `<text x="${outX}" y="${outY}" font-size="${Math.abs(outVal) >= 10 ? '11.5' : '12.5'}" font-weight="800" fill="#f8fafc" text-anchor="middle">${outStr}</text>`;
  }

  // 14 Flute barrel (baseRadius=66, fluteDepth=3.4, count=14)
  const fluteD = buildFlutedPath(66, 3.4, 14);
  let grooves = '';
  for (let g = 0; g < 14; g++) {
    const angle = (g * 360) / 14 + 360 / 28;
    const rad = (angle * Math.PI) / 180;
    grooves += `<line x1="${(58 * Math.cos(rad)).toFixed(2)}" y1="${(58 * Math.sin(rad)).toFixed(2)}" x2="${(66 * Math.cos(rad)).toFixed(2)}" y2="${(66 * Math.sin(rad)).toFixed(2)}"/>`;
  }

  // Range switch small fluted knob
  const swFluteD = buildFlutedPath(16, 1.6, 12);

  return `<g class="mc-ca-only">
      <defs>
        <linearGradient id="mc_dial_slate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d5366"/><stop offset="50%" stop-color="#314353"/><stop offset="100%" stop-color="#24333f"/>
        </linearGradient>
        <linearGradient id="mc_skirt_silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d8dce2"/><stop offset="45%" stop-color="#bfc4cd"/><stop offset="100%" stop-color="#9aa0ab"/>
        </linearGradient>
        <linearGradient id="mc_barrel_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b6bbc4"/><stop offset="100%" stop-color="#888e99"/>
        </linearGradient>
        <linearGradient id="mc_gold_rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d97706"/><stop offset="50%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
        <linearGradient id="mc_yellow_cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="30%" stop-color="#facc15"/>
          <stop offset="70%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#ca8a04"/>
        </linearGradient>
        <linearGradient id="mc_jack_bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#94a3b8"/><stop offset="50%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="mc_shield_blue_ca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a5f"/>
          <stop offset="50%" stop-color="#2a5280"/>
          <stop offset="100%" stop-color="#142842"/>
        </linearGradient>
        <filter id="mc_knob_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.65"/>
        </filter>
        <filter id="mc_badge_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
      </defs>

      <!-- Center Console Bay Outline / Bezel in McCurdy Slate Finish (500x398) -->
      <rect x="1350" y="16" width="500" height="398" rx="8" fill="url(#mc_panel_blue)" stroke="#4d687f" stroke-width="2.5"/>

      <!-- ================================================================= -->
      <!-- LEFT SECTION: JACKS (INPUT 600Ω / 20K, MON OUTPUT 20K) & SA14023  -->
      <!-- ================================================================= -->
      <g id="mc-left-jacks" ${font}>
        <!-- INPUT Header & Bracket grouping Jack 1 and Jack 2 -->
        <text x="1354" y="184" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1">INPUT</text>
        <path d="M 1362,142 H 1358 V 218 H 1362" fill="none" stroke="#f8fafc" stroke-width="1.3"/>

        <!-- Jack 1 (INPUT 600Ω) - Interactive MODE button -->
        <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer" transform="translate(1376, 142)">
          <title>Input 1 (600Ω - MODE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="146" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">600Ω</text>

        <!-- Jack 2 (INPUT 20K) - Interactive SOURCE button -->
        <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer" transform="translate(1376, 215)">
          <title>Input 2 (20K Bridging - SOURCE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="219" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Jack 3 (MON. OUTPUT 20K) -->
        <text x="1354" y="282" font-size="9" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.6">MON.</text>
        <text x="1354" y="294" font-size="9" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.6">OUTPUT</text>
        <g class="xtm-btn mc-jack" data-btn="DOWN" style="cursor:pointer" transform="translate(1376, 288)">
          <title>Monitor Output (20K)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1395" y="292" font-size="10.5" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Model Designation Silkscreen (Lower Left) -->
        <text x="1376" y="388" font-size="13" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="1.8">SA14023</text>
      </g>

      <!-- ================================================================= -->
      <!-- CENTERPIECE: FULL 2 RU VERTICAL USAGE MCCURDY ATTENUATOR KNOB     -->
      <!-- (Diameter 344px spanning y=43..387, Centered at x=1580, y=215)    -->
      <!-- ================================================================= -->
      <g id="mccurdy-vintage-knob-assembly" class="xtm-btn mccurdy-knob" filter="url(#mc_knob_shadow)" style="cursor:grab; touch-action:none; user-select:none;">
        <title>McCurdy SA14023 Dual-Concentric Attenuator (-50 to +10 dB / -30 to +30 dB)</title>

        <!-- Circular Slate Blue Background Plate (r=186) -->
        <circle cx="${kx}" cy="${ky}" r="186" fill="url(#mc_dial_slate)" stroke="#1a2530" stroke-width="2.5"/>
        <circle cx="${kx}" cy="${ky}" r="183" fill="none" stroke="#5a7690" stroke-width="1" stroke-opacity="0.5"/>

        <!-- Silkscreen Scales Group (Inner -30 to +30, Outer -50 to +10) -->
        <g id="mc-knob-scales" ${font}>
          ${scaleTicks}
          <g id="mc_scale_inner_group">${scaleInnerNums}</g>
          <g id="mc_scale_outer_group">${scaleOuterNums}</g>
        </g>

        <!-- Silver Skirt Base Disc (r=96) with Inner Bevel Line -->
        <circle cx="${kx}" cy="${ky}" r="96" fill="url(#mc_skirt_silver)" stroke="#555a64" stroke-width="1.5"/>
        <circle cx="${kx}" cy="${ky}" r="74" fill="none" stroke="#8a909c" stroke-width="1.1"/>

        <!-- Rotating 14-Flute Barrel Body with Solid Triangle Pointer and Yellow Cap -->
        <g id="mccurdy_vintage_knob_rotor" data-cx="${kx}" data-cy="${ky}" transform="translate(${kx}, ${ky})">
          <!-- Solid Black Pointer Arrow at 9 o'clock (-95px to -74px from center on rotating skirt) -->
          <polygon points="-95,0 -74,-9 -74,9" fill="#141517"/>

          <!-- 14-Flute Barrel Body -->
          <path d="${fluteD}" fill="url(#mc_barrel_grad)" stroke="#4b505a" stroke-width="1.3"/>
          <g stroke="#666c77" stroke-width="1.2" stroke-linecap="round">
            ${grooves}
          </g>

          <!-- Outer Raised Gold Bezel Ring (r=48) & Specular Highlight -->
          <circle cx="0" cy="0" r="48" fill="none" stroke="url(#mc_gold_rim)" stroke-width="2.4"/>
          <path d="M -34,-34 A 48,48 0 0 1 34,-34" fill="none" stroke="#fde68a" stroke-width="1.5" stroke-opacity="0.85"/>

          <!-- Bright Cadmium Yellow Cap Face (r=45) matching authentic vintage hardware -->
          <circle cx="0" cy="0" r="45" fill="url(#mc_yellow_cap)" stroke="#9c7a0b" stroke-width="1.0"/>

          <!-- Solid Black Index Line pointing at 9 o'clock (aligned with skirt pointer) -->
          <line x1="-4" y1="0" x2="-42" y2="0" stroke="#141517" stroke-width="3.2" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- RIGHT SECTION: TOGGLE RANGE SWITCH, MCCURDY SHIELD LOGO & TITLE   -->
      <!-- ================================================================= -->
      <g id="mc-right-controls" ${font}>
        <!-- RANGE Header -->
        <text x="1785" y="66" font-size="11" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1.2">RANGE</text>

        <!-- Top Position: MTR Outer (-50 to +10 dB) -->
        <g class="xtm-btn mc-toggle-pos" data-btn="MC_RANGE_OUTER" style="cursor:pointer">
          <text id="mc_toggle_lbl_outer" x="1785" y="84" font-size="11" font-weight="800" fill="#fbbf24" text-anchor="middle" letter-spacing="0.5">MTR</text>
          <text id="mc_toggle_sub_outer" x="1785" y="94" font-size="8" font-weight="700" fill="#fbbf24" text-anchor="middle" letter-spacing="0.4">-50 TO +10</text>
        </g>

        <!-- Middle Position: CAL (+4 dBu reference line-up) -->
        <g class="xtm-btn mc-toggle-pos" data-btn="MC_RANGE_CAL" style="cursor:pointer">
          <text id="mc_toggle_lbl_cal" x="1808" y="118" font-size="9" font-weight="700" fill="#94a3b8" text-anchor="start" letter-spacing="0.4">CAL</text>
        </g>

        <!-- Bottom Position: MON Inner (-30 to +30 dB) -->
        <g class="xtm-btn mc-toggle-pos" data-btn="MC_RANGE_INNER" style="cursor:pointer">
          <text id="mc_toggle_sub_inner" x="1785" y="142" font-size="8" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="0.4">-30 TO +30</text>
          <text id="mc_toggle_lbl_inner" x="1785" y="154" font-size="11" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="0.5">MON</text>
        </g>

        <!-- Guidance Routing Lines connecting Range Switch to dial scales -->
        <!-- Outer scale bracket line from -50 TO +10 -->
        <path d="M 1735,94 C 1718,100 1704,115 1702,135 V 285 C 1704,302 1718,312 1735,318" fill="none" stroke="#f8fafc" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="1735" y1="94" x2="1742" y2="94" stroke="#f8fafc" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="1735" y1="318" x2="1742" y2="318" stroke="#f8fafc" stroke-width="1.2" stroke-opacity="0.8"/>

        <!-- Chrome Bat-Handle Toggle Switch Assembly (cx=1785, cy=115) -->
        <g id="mc-toggle-assembly" class="xtm-btn" data-btn="MC_TOGGLE" style="cursor:pointer" transform="translate(1785, 115)">
          <title>Range Switch: Click to Toggle Range (MTR Outer: -50..+10 dB / MON Inner: -30..+30 dB / CAL: 0 VU)</title>
          <!-- Chrome Hex Nut & Mounting Bushing -->
          <polygon points="0,-12 10.4,-6 10.4,6 0,12 -10.4,6 -10.4,-6" fill="url(#chromeMetalGrad)" stroke="#1a252f" stroke-width="1.2" />
          <circle cx="0" cy="0" r="9" fill="url(#chromeMetalGrad)" stroke="#1a252f" stroke-width="1.0" />
          <circle cx="0" cy="0" r="5.5" fill="#141c24" stroke="#0a121a" stroke-width="0.9" />

          <!-- Bat Handle Stick (Angled to -24° Outer, 0° CAL, +24° Inner) -->
          <g id="mc_toggle_stick_rotor" transform="rotate(-24)">
            <!-- Drop Shadow under Lever -->
            <line x1="1" y1="1" x2="1" y2="-25" stroke="#0f171e" stroke-width="5.2" stroke-linecap="round" opacity="0.6" />
            <!-- Main Chrome Shaft -->
            <line x1="0" y1="0" x2="0" y2="-24" stroke="#dce1e8" stroke-width="4.8" stroke-linecap="round" />
            <!-- Specular Highlight -->
            <line x1="0" y1="0" x2="0" y2="-24" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.85" />
            <!-- Tip Ball -->
            <circle cx="0" cy="-24" r="3.2" fill="#f8fafc" stroke="#6b7280" stroke-width="0.7" />
          </g>
        </g>

        <!-- McCurdy Vintage Shield Cartouche Logo (cx=1785, cy=220) -->
        <g id="mccurdy-vintage-shield-badge" filter="url(#mc_badge_shadow)">
          <svg x="1743" y="198" width="84" height="42" viewBox="100 85 800 370" aria-hidden="true">
            <!-- Symmetrical Shield Border & Metallic Blue Field -->
            <path d="M 140,185 Q 132,160 165,155 L 475,112 Q 500,108 525,112 L 835,155 Q 868,160 860,185 L 785,375 Q 775,398 748,402 L 525,442 Q 500,446 475,442 L 252,402 Q 225,398 215,375 Z"
                  fill="url(#mc_shield_blue_ca)" stroke="#f8fafc" stroke-width="24" stroke-linejoin="round"/>
            <!-- Lowercase 'm' with extended crossbar -->
            <path d="M 248,175 L 322,175 L 322,200 C 342,178 368,170 394,173 C 418,176 434,188 444,206 C 464,180 494,170 524,173 C 564,177 586,206 586,250 L 586,322 L 782,322 L 770,350 L 586,350 L 586,362 L 608,362 L 608,385 L 498,385 L 498,362 L 520,362 L 520,350 L 452,350 L 452,322 L 520,322 L 520,255 C 520,230 508,218 488,218 C 468,218 454,232 454,258 L 454,305 L 390,305 L 390,255 C 390,230 378,218 358,218 C 338,218 324,232 324,258 L 324,362 L 346,362 L 346,385 L 248,385 L 248,362 L 268,362 L 268,200 L 248,200 Z"
                  fill="#f8fafc"/>
            <!-- CCURDY Lettering -->
            <g fill="#f8fafc" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="800" letter-spacing="1.5">
              <text x="598" y="258" font-size="32">C</text>
              <text x="622" y="272" font-size="44">CURDY</text>
            </g>
          </svg>
        </g>

        <!-- Silkscreen Designation Below Shield -->
        <text x="1785" y="272" font-size="11.5" font-weight="800" fill="#f8fafc" text-anchor="middle" letter-spacing="1.5">EXTENDED RANGE</text>
        <text x="1785" y="288" font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="1">AUDIO LEVEL METER</text>
      </g>
    </g>`;
}

export function renderMcCurdyCenter(): string {
  return renderMcCurdyComCenter() + renderMcCurdyCaCenter();
}
