/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Clock Shell: Photorealistic broadcast meter-style dial face.
 * Connected at the stylesheet to the active meter skin (WBS Vintage,
 * WBS Modern, McCurdy Dark, McCurdy Light).
 * No redundant middle box; clean meter scale with solid yellow fill
 * warning/cue band and NRC Canada official broadcast alignment.
 */

import type { ClockTheme } from './types';

export const WARN_YELLOW = '#facc15'; // Solid yellow warning/cue marker fill

/** Build SVG path for an annular sector with SOLID fill (no transparency) */
function makeAnnularBand(rInner: number, rOuter: number, startDeg: number, endDeg: number): string {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const a1 = toRad(startDeg);
  const a2 = toRad(endDeg);

  const x1In = Math.cos(a1) * rInner;
  const y1In = Math.sin(a1) * rInner;
  const x2In = Math.cos(a2) * rInner;
  const y2In = Math.sin(a2) * rInner;

  const x1Out = Math.cos(a1) * rOuter;
  const y1Out = Math.sin(a1) * rOuter;
  const x2Out = Math.cos(a2) * rOuter;
  const y2Out = Math.sin(a2) * rOuter;

  return `M ${x1In.toFixed(2)} ${y1In.toFixed(2)} ` +
         `A ${rInner} ${rInner} 0 0 1 ${x2In.toFixed(2)} ${y2In.toFixed(2)} ` +
         `L ${x2Out.toFixed(2)} ${y2Out.toFixed(2)} ` +
         `A ${rOuter} ${rOuter} 0 0 0 ${x1Out.toFixed(2)} ${y1Out.toFixed(2)} Z`;
}

export function renderClockDefs(): string {
  return `<defs>
    <!-- Outer Molded Meter Bezel Gradient -->
    <linearGradient id="clockBezelRim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5a6068" />
      <stop offset="18%" stop-color="#212327" />
      <stop offset="50%" stop-color="#121316" />
      <stop offset="82%" stop-color="#212327" />
      <stop offset="100%" stop-color="#464a52" />
    </linearGradient>

    <!-- Inner Metallic Window Bevel Frame -->
    <linearGradient id="clockWindowBevel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e3238" />
      <stop offset="25%" stop-color="#8a9099" />
      <stop offset="75%" stop-color="#4c525a" />
      <stop offset="100%" stop-color="#a8b0ba" />
    </linearGradient>

    <!-- Dark Broadcast Meter Dial Face Background -->
    <radialGradient id="meterDialDark" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#191c23" />
      <stop offset="60%" stop-color="#111318" />
      <stop offset="90%" stop-color="#0a0c0f" />
      <stop offset="100%" stop-color="#050608" />
    </radialGradient>

    <!-- Vintage Ward-Beck Cream Parchment Face -->
    <radialGradient id="clockDialCream" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#faf5e6" />
      <stop offset="65%" stop-color="#f0e4c8" />
      <stop offset="90%" stop-color="#e3d2ab" />
      <stop offset="100%" stop-color="#cca852" />
    </radialGradient>

    <!-- McCurdy Studio Neutral Dark Face -->
    <radialGradient id="clockDialMcCurdyDark" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#20242c" />
      <stop offset="65%" stop-color="#15171d" />
      <stop offset="92%" stop-color="#0e1014" />
      <stop offset="100%" stop-color="#060709" />
    </radialGradient>

    <!-- McCurdy ATS-100 Console Light Cream Face -->
    <radialGradient id="clockDialMcCurdyLight" cx="50%" cy="50%" r="68%">
      <stop offset="0%" stop-color="#fdfbf5" />
      <stop offset="65%" stop-color="#eee9db" />
      <stop offset="90%" stop-color="#ded8c7" />
      <stop offset="100%" stop-color="#c8bfab" />
    </radialGradient>

    <!-- Warm Filament Halo Glow -->
    <radialGradient id="clockFilamentGlow" cx="50%" cy="25%" r="72%">
      <stop offset="0%" stop-color="#ffb74d" stop-opacity="0.18" />
      <stop offset="50%" stop-color="#ff9800" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Recess Chamber Drop Shadow -->
    <radialGradient id="clockChamberShadow" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="#000000" stop-opacity="0" />
      <stop offset="94%" stop-color="#000000" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
    </radialGradient>

    <!-- Curved Specular Glass Sheen -->
    <linearGradient id="clockGlassSheen" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14" />
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.03" />
      <stop offset="65%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.07" />
    </linearGradient>

    <!-- Center Boss Metallic Collar -->
    <linearGradient id="clockBossGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#444a52" />
      <stop offset="30%" stop-color="#181a1e" />
      <stop offset="70%" stop-color="#0c0d10" />
      <stop offset="100%" stop-color="#2e3238" />
    </linearGradient>
  </defs>`;
}

export function renderClockDialFace(theme: ClockTheme = 'wbs-dark'): string {
  const rArc = 168;
  const rBandOuter = 188;

  // Solid yellow warning band: 10 o'clock to 12 o'clock (-60 deg to 0 deg / 300 to 360 deg)
  // "no black in here solid yellow fill"
  const yellowBandSvg = makeAnnularBand(rArc, rBandOuter, -60, 0);

  // Generate 60 ticks around the chapter ring
  let ticksSvg = '';
  for (let i = 0; i < 60; i++) {
    const deg = i * 6;
    const angleRad = (deg - 90) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const isQuarter = i % 15 === 0;
    const inYellowBand = (i >= 50 && i <= 59) || i === 0;

    if (inYellowBand) {
      // Solid black ticks inside the solid yellow band per meter photo
      const tickInner = rArc;
      const tickOuter = isMajor ? rBandOuter - 2 : rArc + 12;
      const x1 = Math.cos(angleRad) * tickInner;
      const y1 = Math.sin(angleRad) * tickInner;
      const x2 = Math.cos(angleRad) * tickOuter;
      const y2 = Math.sin(angleRad) * tickOuter;
      const strokeW = isMajor ? 3.8 : 2.2;
      ticksSvg += `<line class="clock-tick clock-tick-warn" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#111317" stroke-width="${strokeW}" stroke-linecap="butt"/>`;
    } else {
      // Standard ticks (styled via stylesheet)
      const tickInner = isQuarter ? rArc + 2 : rArc + 2;
      const tickOuter = isQuarter ? rArc + 24 : (isMajor ? rArc + 20 : rArc + 12);
      const x1 = Math.cos(angleRad) * tickInner;
      const y1 = Math.sin(angleRad) * tickInner;
      const x2 = Math.cos(angleRad) * tickOuter;
      const y2 = Math.sin(angleRad) * tickOuter;
      const strokeW = isQuarter ? 3.5 : (isMajor ? 2.8 : 1.3);
      ticksSvg += `<line class="clock-tick clock-tick-std" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
    }
  }

  // 12-Hour Numerals
  const numerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  let numsSvg = '';
  for (let i = 0; i < 12; i++) {
    const deg = i * 30;
    const angleRad = (deg - 90) * (Math.PI / 180);
    const rNum = 140;
    const nx = Math.cos(angleRad) * rNum;
    const ny = Math.sin(angleRad) * rNum + 7;
    const isWarnZone = (i === 10 || i === 11 || i === 0);
    const cls = isWarnZone ? 'clock-num clock-num-warn' : 'clock-num clock-num-std';
    numsSvg += `<text class="${cls}" x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="800" text-anchor="middle">${numerals[i]}</text>`;
  }

  // Meter Reference Markers (0 and +4 above 10 and 12, matching user meter photo!)
  const toRad = (d: number) => (d - 90) * (Math.PI / 180);
  const a0 = toRad(-60); // 10 o'clock position (0 VU marker)
  const a4 = toRad(0);   // 12 o'clock position (+4 VU marker)
  const [x0Marker, y0Marker] = [Math.cos(a0) * 198, Math.sin(a0) * 198 + 4];
  const [x4Marker, y4Marker] = [Math.cos(a4) * 198, Math.sin(a4) * 198 + 4];
  const meterScaleMarkers = `
    <text class="clock-num-warn" x="${x0Marker.toFixed(1)}" y="${y0Marker.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle">0</text>
    <text class="clock-num-warn" x="${x4Marker.toFixed(1)}" y="${y4Marker.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle">+4</text>
  `;

  // Inner 24-Hour Military/Broadcast Scale (13 to 24)
  const num24s = ['24', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  let nums24Svg = '';
  for (let i = 0; i < 12; i++) {
    const deg = i * 30;
    const angleRad = (deg - 90) * (Math.PI / 180);
    const rNum = 112;
    const nx = Math.cos(angleRad) * rNum;
    const ny = Math.sin(angleRad) * rNum + 4;
    nums24Svg += `<text class="clock-num-24" x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${num24s[i]}</text>`;
  }

  return `
    <!-- Molded Bezel Rim (Meter Style) -->
    <circle cx="0" cy="0" r="236" fill="url(#clockBezelRim)" />
    <circle cx="0" cy="0" r="226" fill="#14161a" stroke="url(#clockWindowBevel)" stroke-width="3" />
    <circle cx="0" cy="0" r="214" fill="#090b0e" />

    <!-- Meter Dial Face Plate (styled via stylesheet) -->
    <circle class="clock-dial-plate xt-face" cx="0" cy="0" r="206" />

    <!-- Warm Filament Halo Glow -->
    <circle cx="0" cy="0" r="206" fill="url(#clockFilamentGlow)" pointer-events="none" />

    <!-- SOLID YELLOW FILL Overload/Cue Warning Band (no black in here, solid yellow fill) -->
    <path class="clock-yellow-band" d="${yellowBandSvg}" stroke="none" />

    <!-- Continuous Baseline Arc (at r = ${rArc}) -->
    <circle class="clock-baseline-arc" cx="0" cy="0" r="${rArc}" fill="none" stroke-width="3.5" />

    <!-- Chapter Ring Inner Track -->
    <circle class="clock-inner-track" cx="0" cy="0" r="126" fill="none" stroke-width="0.8" stroke-dasharray="2,3" />

    <!-- Ticks & Numerals -->
    <g class="clock-ticks-group">${ticksSvg}</g>
    <g class="clock-numbers-group">${numsSvg}</g>
    <g class="clock-numbers-24">${nums24Svg}</g>
    <g class="meter-scale-markers">${meterScaleMarkers}</g>

    <!-- Brand Badges (Theme Connected at Stylesheet) -->
    <g class="clock-brand clock-brand-wbs-modern wbs-modern-only" style="cursor:pointer;" title="Ward-Beck Systems VU Master Clock">
      <rect x="-60" y="-76" width="120" height="38" rx="5" fill="#0b0d10" stroke="#22c55e" stroke-width="1.6"/>
      <text x="0" y="-58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="900" fill="#22c55e" text-anchor="middle" letter-spacing="1.2">WARD-BECK</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#cbd5e1" text-anchor="middle" letter-spacing="1.5">VU MASTER CLOCK</text>
    </g>

    <g class="clock-brand clock-brand-wbs-vintage wbs-ca-only" style="cursor:pointer;" title="Ward-Beck Systems Vintage Master Clock">
      <rect x="-60" y="-76" width="120" height="38" rx="5" fill="#ffffff" stroke="#f97316" stroke-width="1.8"/>
      <text x="0" y="-58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="900" fill="#f97316" text-anchor="middle" letter-spacing="1.2">WARD-BECK</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#2a2b2a" text-anchor="middle" letter-spacing="1.5">SYSTEMS · TORONTO</text>
    </g>

    <g class="clock-brand clock-brand-mc mc-only" style="cursor:pointer;" title="McCurdy Radio Industries Studio Master Clock">
      <rect x="-56" y="-76" width="112" height="38" rx="5" fill="#142842" stroke="#d9e2ec" stroke-width="1.4"/>
      <text x="0" y="-57" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">McCURDY</text>
      <text x="0" y="-44" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" fill="#9fb3c8" text-anchor="middle" letter-spacing="1.2">STUDIO CLOCK</text>
    </g>

    <!-- NRC-CNRC Official Time Alignment Inscription & Canadian Broadcast Logo (Canada) -->
    <g class="clock-nrc-inscription" transform="translate(0, 52)">
      <!-- Official Canadian Maple Leaf Badge -->
      <g class="clock-nrc-leaf-badge" transform="translate(0, 0)">
        <path class="clock-nrc-leaf-path" d="M 0,-10 L 1.5,-6.2 L 4.2,-6.8 L 4.5,-3.8 L 2.9,-3.4 L 6.9,-3.5 L 9.8,-0.5 L 7.6,1.3 L 3.9,0.8 L 5.9,3.6 L 2.2,3.9 L 0.7,8.7 L -0.7,8.7 L -2.2,3.9 L -5.9,3.6 L -3.9,0.8 L -7.6,1.3 L -9.8,-0.5 L -6.9,-3.5 L -2.9,-3.4 L -4.5,-3.8 L -4.2,-6.8 L -1.5,-6.2 Z" fill="#b91c1c" />
      </g>
      <text x="0" y="17" font-family="'Helvetica Neue', Arial, sans-serif" font-size="8.5" font-weight="800" text-anchor="middle" letter-spacing="1.8" class="clock-nrc-lbl">NRC · CNRC OFFICIAL TIME</text>
      <text x="0" y="28" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="1.2" class="clock-nrc-sub">CANADIAN BROADCAST STANDARD</text>
      <text x="0" y="39" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="1.1" class="clock-nrc-srv">time.nrc.ca</text>
      <text x="0" y="49" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="1.1" class="clock-nrc-srv">time.chu.nrc.ca</text>
    </g>

    <!-- Chamber Recess Shadows -->
    <circle cx="0" cy="0" r="206" fill="url(#clockChamberShadow)" pointer-events="none" />

    <!-- Glass Curved Specular Sheen -->
    <circle cx="0" cy="0" r="206" fill="url(#clockGlassSheen)" pointer-events="none" />
  `;
}
