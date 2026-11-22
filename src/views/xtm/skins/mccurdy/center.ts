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

/** 2. McCurdyRadio.ca (Studio Broadcast All-Blue Panel with Centered Attenuator & Input Selectors Below) */
export function renderMcCurdyCaCenter(): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;

  // Centered horizontally in center bay (x: 1350 to 1850 -> center 1600)
  // Scaled 30% larger, positioned with ky = 186 to leave clean clearance for input buttons below (by = 374)
  const kx = 1600, ky = 186;

  let scaleTicks = '';
  let scaleInnerNums = '';
  let scaleOuterNums = '';

  // 31 steps spanning 270° clockwise from 135° (4:30) to 405° = 45° (1:30)
  // Step 0:  135° (4:30)  -> Outer: -50, Inner: -30
  // Step 5:  180° (6:00)  -> Outer: -40, Inner: -20
  // Step 15: 270° (9:00)  -> Outer: -20, Inner: 0 (Horizontal Left)
  // Step 25: 360° (12:00) -> Outer: 0,   Inner: +20 (Center Top)
  // Step 30: 405° (1:30)  -> Outer: +10, Inner: +30
  // All radii scaled 30% larger (1.30x)
  const rOuterNum = 164;
  const rTickOut = 150;
  const rTickInMajor = 135;
  const rTickInMinor = 139;
  const rInnerNum = 120;

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

    // Radial Ticks (pointing from center outward directly on chassis panel)
    const x1 = (kx + rIn * sin).toFixed(1);
    const y1 = (ky - rIn * cos).toFixed(1);
    const x2 = (kx + rTickOut * sin).toFixed(1);
    const y2 = (ky - rTickOut * cos).toFixed(1);

    scaleTicks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="${isMajor ? '2.2' : '1.3'}" stroke-opacity="${isMajor ? '0.95' : '0.8'}"/>`;

    // Inner Scale Numbers (r=120)
    const inX = (kx + rInnerNum * sin).toFixed(1);
    const inY = (ky - rInnerNum * cos + 3.5).toFixed(1);
    scaleInnerNums += `<text x="${inX}" y="${inY}" font-size="${Math.abs(inVal) >= 10 ? '10' : '11'}" font-weight="700" fill="#cbd5e1" text-anchor="middle">${inStr}</text>`;

    // Outer Scale Numbers (r=164)
    const outX = (kx + rOuterNum * sin).toFixed(1);
    const outY = (ky - rOuterNum * cos + 4.0).toFixed(1);
    scaleOuterNums += `<text x="${outX}" y="${outY}" font-size="${Math.abs(outVal) >= 10 ? '11' : '12'}" font-weight="800" fill="#f8fafc" text-anchor="middle">${outStr}</text>`;
  }

  // 14 Flute barrel (scaled 30%: baseRadius=63.7, fluteDepth=3.38, count=14)
  const fluteD = buildFlutedPath(63.7, 3.38, 14);
  let grooves = '';
  for (let g = 0; g < 14; g++) {
    const angle = (g * 360) / 14 + 360 / 28;
    const rad = (angle * Math.PI) / 180;
    grooves += `<line x1="${(55.9 * Math.cos(rad)).toFixed(2)}" y1="${(55.9 * Math.sin(rad)).toFixed(2)}" x2="${(63.7 * Math.cos(rad)).toFixed(2)}" y2="${(63.7 * Math.sin(rad)).toFixed(2)}"/>`;
  }

  // Range switch small fluted knob
  const swFluteD = buildFlutedPath(16, 1.6, 12);

  return `<g class="mc-ca-only">
      <defs>
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
      </defs>

      <!-- Center Console Bay in McCurdy Slate Finish (Seamless, No Border) -->
      <rect x="1350" y="16" width="500" height="398" rx="8" fill="url(#mc_panel_blue)"/>

      <!-- ================================================================= -->
      <!-- LEFT SECTION: JACKS (INPUT 600Ω / 20K, MON OUTPUT 20K) & SA14023  -->
      <!-- ================================================================= -->
      <g id="mc-left-jacks" ${font}>
        <!-- INPUT Header & Bracket grouping Jack 1 and Jack 2 -->
        <text x="1356" y="132" font-size="10" font-weight="800" fill="#f8fafc" text-anchor="end" letter-spacing="1">INPUT</text>
        <path d="M 1366,92 H 1362 V 168 H 1366" fill="none" stroke="#f8fafc" stroke-width="1.3"/>

        <!-- Jack 1 (INPUT 600Ω) - Interactive MODE button -->
        <g class="xtm-btn mc-jack" data-btn="MODE" style="cursor:pointer" transform="translate(1382, 92)">
          <title>Input 1 (600Ω - MODE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1400" y="96" font-size="10" font-weight="800" fill="#f8fafc" text-anchor="start">600Ω</text>

        <!-- Jack 2 (INPUT 20K) - Interactive SOURCE button -->
        <g class="xtm-btn mc-jack" data-btn="SOURCE" style="cursor:pointer" transform="translate(1382, 168)">
          <title>Input 2 (20K Bridging - SOURCE)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1400" y="172" font-size="10" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Jack 3 (MON. OUTPUT 20K) -->
        <text x="1356" y="240" font-size="8.5" font-weight="800" fill="#cbd5e1" text-anchor="end" letter-spacing="0.6">MON.</text>
        <text x="1356" y="252" font-size="8.5" font-weight="800" fill="#cbd5e1" text-anchor="end" letter-spacing="0.6">OUTPUT</text>
        <g class="xtm-btn mc-jack" data-btn="DOWN" style="cursor:pointer" transform="translate(1382, 244)">
          <title>Monitor Output (20K)</title>
          <circle cx="0" cy="0" r="13" fill="url(#mc_jack_bezel)" stroke="#0f172a" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="9" fill="#1b242e" stroke="#0a121a" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.8" fill="#06090c"/>
        </g>
        <text x="1400" y="248" font-size="10" font-weight="800" fill="#f8fafc" text-anchor="start">20K</text>

        <!-- Model Designation Silkscreen (Lower Left) -->
        <text x="1382" y="378" font-size="12" font-weight="900" fill="#94a3b8" text-anchor="middle" letter-spacing="1.5">SA14023</text>
      </g>

      <!-- ================================================================= -->
      <!-- CENTERPIECE: CENTERED MCCURDY ATTENUATOR KNOB & DUAL SCALE       -->
      <!-- (30% larger, engraved directly on blue panel with no disc shadow) -->
      <!-- ================================================================= -->
      <g id="mccurdy-vintage-knob-assembly" class="xtm-btn mccurdy-knob" style="cursor:grab; touch-action:none; user-select:none;">
        <title>McCurdy SA14023 Dual-Concentric Attenuator (-50 to +10 dB / -30 to +30 dB)</title>

        <!-- Silkscreen Scales Group (Inner -30 to +30, Outer -50 to +10) -->
        <g id="mc-knob-scales" ${font}>
          ${scaleTicks}
          <g id="mc_scale_inner_group">${scaleInnerNums}</g>
          <g id="mc_scale_outer_group">${scaleOuterNums}</g>
        </g>

        <!-- Silver Skirt Base Disc (r=92, 30% larger) with Inner Bevel Line -->
        <circle cx="${kx}" cy="${ky}" r="92" fill="url(#mc_skirt_silver)" stroke="#555a64" stroke-width="1.6"/>
        <circle cx="${kx}" cy="${ky}" r="72" fill="none" stroke="#8a909c" stroke-width="1.1"/>

        <!-- Rotating 14-Flute Barrel Body with Solid Triangle Pointer and Yellow Cap -->
        <g id="mccurdy_vintage_knob_rotor" data-cx="${kx}" data-cy="${ky}" transform="translate(${kx}, ${ky})">
          <!-- Solid Black Pointer Arrow at 9 o'clock (-91px to -72px on rotating skirt) -->
          <polygon points="-91,0 -72,-9 -72,9" fill="#141517"/>

          <!-- 14-Flute Barrel Body (30% larger) -->
          <path d="${fluteD}" fill="url(#mc_barrel_grad)" stroke="#4b505a" stroke-width="1.4"/>
          <g stroke="#666c77" stroke-width="1.2" stroke-linecap="round">
            ${grooves}
          </g>

          <!-- Outer Raised Gold Bezel Ring (r=46) & Specular Highlight -->
          <circle cx="0" cy="0" r="46" fill="none" stroke="url(#mc_gold_rim)" stroke-width="2.6"/>
          <path d="M -32.5,-32.5 A 46,46 0 0 1 32.5,-32.5" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-opacity="0.85"/>

          <!-- Bright Cadmium Yellow Cap Face (r=43) matching authentic vintage hardware -->
          <circle cx="0" cy="0" r="43" fill="url(#mc_yellow_cap)" stroke="#9c7a0b" stroke-width="1.0"/>

          <!-- Solid Black Index Line pointing at 9 o'clock (aligned with skirt pointer) -->
          <line x1="-4" y1="0" x2="-40" y2="0" stroke="#141517" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- RIGHT SECTION: TOGGLE SWITCH (UPPER)                              -->
      <!-- ================================================================= -->
      <!-- Chrome Bat-Handle Toggle Switch Assembly (Upper Right, cx=1805, cy=105) -->
      <g id="mc-toggle-assembly" class="xtm-btn" data-btn="MC_TOGGLE" style="cursor:pointer" transform="translate(1805, 105)">
        <title>Range Switch: Click to Toggle Range (MTR / CAL / MON)</title>
        <text id="mc_toggle_lbl_outer" x="0" y="-32" ${font} font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">MTR</text>
        <text id="mc_toggle_lbl_cal" x="22" y="3.5" ${font} font-size="9" font-weight="700" fill="#94a3b8" text-anchor="start">CAL</text>
        <text id="mc_toggle_lbl_inner" x="0" y="38" ${font} font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">MON</text>

        <!-- Chrome Bezel Nut -->
        <circle cx="0" cy="0" r="19" fill="url(#chromeMetalGrad)" stroke="#1a2530" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="13.5" fill="#141c24" stroke="#0a121a" stroke-width="1"/>

        <!-- Bat Handle Stick (Angled Upwards to MTR) -->
        <g id="mc_toggle_stick_rotor" transform="rotate(-24)">
          <path d="M -3.5,0 L -4,-28 C -4,-33 4,-33 4,-28 L 3.5,0 Z" fill="url(#mc_toggle_stick)" stroke="#334155" stroke-width="0.8"/>
          <circle cx="0" cy="-30" r="4.8" fill="#f1f5f9"/>
        </g>
      </g>

      <!-- ================================================================= -->
      <!-- BOTTOM SECTION: INPUT 1 2 3 4 SELECTORS (CENTERED BELOW)          -->
      <!-- ================================================================= -->
      <g id="mc-bottom-selectors" ${font}>
        ${[1, 2, 3, 4].map(i => {
          const bx = 1600 + (i - 2.5) * 72;
          const by = 374;
          return `
        <g class="xtm-btn mc-selector-btn ${i === 1 ? 'mc-btn-latched' : ''}" id="mc_input_btn_${i}" data-btn="INPUT_${i}" data-input="${i}" style="cursor:pointer" transform="translate(${bx}, ${by})" role="button" tabindex="0" aria-label="Input ${i}">
          <title>Input ${i} Selector Switch (Push to select, snaps up when another is pushed)</title>
          <!-- Outer Bezel & Well -->
          <circle cx="0" cy="0" r="17" fill="url(#chromeMetalGrad)" stroke="#152636" stroke-width="1.3"/>
          <circle cx="0" cy="0" r="13" fill="#0d141c" stroke="#080e14" stroke-width="1"/>
          <!-- Pushbutton Cap (Latches down / snaps up) -->
          <circle class="mc-btn-cap" cx="0" cy="0" r="10.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <text class="mc-btn-label" x="0" y="4" font-size="11.5" font-weight="900" fill="#f8fafc" text-anchor="middle">${i}</text>
          <!-- Input Label Below Switch -->
          <text x="0" y="27" font-size="9.5" font-weight="700" fill="#cbd5e1" text-anchor="middle" letter-spacing="0.5">INPUT ${i}</text>
        </g>`;
        }).join('')}
      </g>
    </g>`;
}

export function renderMcCurdyCenter(): string {
  return renderMcCurdyComCenter() + renderMcCurdyCaCenter();
}
