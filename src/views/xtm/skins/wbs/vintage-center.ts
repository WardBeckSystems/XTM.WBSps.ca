/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems Vintage Centre Console (Ward-Beck.ca):
 * - Broadcast slate-blue baked enamel panel cassette matching wbs_mccurdy_dual_channel panel.
 * - Top & bottom brushed/anodized lips and slotted nickel chassis mounting screws.
 * - DR Differential Decade / Vernier Dial Scale with crisp silver-white silkscreening.
 * - Skirted fluted Bakelite instrument knob with high-contrast white index line and pointer.
 * - AC jeweled pilot indicator lamp assembly with chrome collar and warm incandescent filament glow.
 */

export function renderVintageWbsCenter(isPowered = true): string {
  // Center controls mounted directly on the Ward-Beck M600 faceplate
  return `<g class="wbs-ca-only" id="vintage-wbs-center">
    <!-- Centered DR Vernier Dial Scale + Fluted Instrument Knob (Centered at x=1600, y=154, Scale=0.94) -->
    <g transform="translate(1600, 154) scale(0.94)">
      <!-- DR Differential Decade / Vernier Dial Scale & Markings (Origin at 0, 0) -->
      <g id="dr-dial-scale" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" fill="#2A2B2A" stroke="#2A2B2A">
        <!-- Top Header "DR" and "- 0 +" -->
        <text x="0" y="-112" font-size="14" font-weight="700" text-anchor="middle" stroke="none" letter-spacing="1.2">DR</text>
        <text x="-13" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none">–</text>
        <text x="0" y="-95" font-size="12.5" font-weight="700" text-anchor="middle" stroke="none">0</text>
        <text x="13" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none">+</text>

        <!-- Center Zero Index Line (0 deg) -->
        <g>
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
        </g>

        <!-- LEFT SIDE SCALE (-10 to -50, every 36 deg per 10 units = 7.2 deg per 2 units) -->
        <!-- Major Ticks & Labels (-10, -20, -30, -40, -50) -->
        <g transform="rotate(-36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(36, 0, -100)">10</text>
        </g>
        <g transform="rotate(-72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(72, 0, -100)">20</text>
        </g>
        <g transform="rotate(-108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(108, 0, -100)">30</text>
        </g>
        <g transform="rotate(-144)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(144, 0, -100)">40</text>
        </g>
        <g transform="rotate(-180)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(180, 0, -100)">50</text>
        </g>

        <!-- Left Sub-Numerals (2, 4, 6, 8 between each major division) -->
        <g font-size="7.5" font-weight="700" text-anchor="middle" stroke="none" fill="#454C59">
          <!-- 0 to -10 -->
          <text x="-11" y="-85">2</text>
          <text x="-22" y="-83">4</text>
          <text x="-33" y="-80">6</text>
          <text x="-43" y="-75">8</text>
          <!-- -10 to -20 -->
          <text x="-62" y="-63">2</text>
          <text x="-70" y="-55">4</text>
          <text x="-76" y="-46">6</text>
          <text x="-82" y="-36">8</text>
          <!-- -20 to -30 -->
          <text x="-88" y="-14">2</text>
          <text x="-89" y="-3">4</text>
          <text x="-89" y="8">6</text>
          <text x="-87" y="19">8</text>
          <!-- -30 to -40 -->
          <text x="-80" y="40">2</text>
          <text x="-74" y="50">4</text>
          <text x="-67" y="59">6</text>
          <text x="-59" y="67">8</text>
          <!-- -40 to -50 -->
          <text x="-40" y="79">2</text>
          <text x="-30" y="84">4</text>
          <text x="-20" y="87">6</text>
          <text x="-10" y="89">8</text>
        </g>

        <!-- RIGHT SIDE SCALE (+10 to +30, every 36 deg per 10 units) -->
        <!-- Major Ticks & Labels (+10, +20, +30) -->
        <g transform="rotate(36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-36, 0, -100)">10</text>
        </g>
        <g transform="rotate(72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-72, 0, -100)">20</text>
        </g>
        <g transform="rotate(108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.8" />
          <text x="0" y="-96" font-size="12" font-weight="700" text-anchor="middle" stroke="none" transform="rotate(-108, 0, -100)">30</text>
        </g>

        <!-- Right Sub-Numerals (2, 4, 6, 8 between major divisions) -->
        <g font-size="7.5" font-weight="700" text-anchor="middle" stroke="none" fill="#454C59">
          <!-- 0 to +10 -->
          <text x="11" y="-85">2</text>
          <text x="22" y="-83">4</text>
          <text x="33" y="-80">6</text>
          <text x="43" y="-75">8</text>
          <!-- +10 to +20 -->
          <text x="62" y="-63">2</text>
          <text x="70" y="-55">4</text>
          <text x="76" y="-46">6</text>
          <text x="82" y="-36">8</text>
          <!-- +20 to +30 -->
          <text x="88" y="-14">2</text>
          <text x="89" y="-3">4</text>
          <text x="89" y="8">6</text>
          <text x="87" y="19">8</text>
        </g>
      </g>

      <!-- Skirted Fluted Instrument Knob (Centered at 0, 0) -->
      <g id="instrument-knob" class="xtm-btn wbs-vintage-knob" style="cursor:grab; touch-action:none; user-select:none;" filter="url(#knobDropShadow)">
        <title>Ward-Beck DR Vernier Attenuator (Drag slowly or scroll mouse-wheel to adjust)</title>
        <!-- Outer Skirt Base Disc -->
        <circle cx="0" cy="0" r="76" fill="url(#skirtGrad)" stroke="#090a0b" stroke-width="1.2" />
        <!-- Subtle Specular Rim Highlight on Skirt -->
        <path d="M -70,-30 A 76,76 0 0 1 62,-44" fill="none" stroke="#52565c" stroke-width="1.1" stroke-opacity="0.65" />

        <!-- White Triangular Pointer on Skirt (Pointing to ~ +4.2 on right scale = +15 deg) -->
        <g id="wbs_vintage_knob_pointer" transform="rotate(15)">
          <polygon points="0,-74 -8.5,-54 8.5,-54" fill="#eceae2" stroke="#18191b" stroke-width="0.6" />
        </g>

        <!-- 3D Extruded Fluted Barrel (Shifted slightly down-right to show perspective depth) -->
        <g id="wbs_vintage_knob_rotor" transform="translate(7, 9) rotate(15)">
          <!-- Fluted Ribs / Scallops around Barrel -->
          <g fill="url(#knobBodyGrad)" stroke="#0b0c0d" stroke-width="0.8">
            <circle cx="0" cy="0" r="47" />
            <!-- 14 Molded Grip Ribs -->
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(0)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(25.7)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(51.4)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(77.1)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(102.8)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(128.5)" />
            <rect x="-5" y="-50" width="10" height="100" rx="4" transform="rotate(154.2)" />
          </g>

          <!-- Connecting Barrel Side Highlights -->
          <path d="M -36,-32 L -44,-40 M -16,-46 L -22,-55 M 8,-48 L 4,-58 M 30,-38 L 28,-48" stroke="#4d5157" stroke-width="1.4" stroke-linecap="round" />

          <!-- Front Glossy Cap -->
          <circle cx="0" cy="0" r="41" fill="url(#knobCapGrad)" stroke="#070809" stroke-width="1.2" />
          <!-- Chamfered Cap Rim Highlight -->
          <path d="M -32,-24 A 40,40 0 0 1 34,-20" fill="none" stroke="#686d75" stroke-width="1.2" />

          <!-- White Radial Indicator Line on Cap & Top Flute -->
          <line x1="0" y1="3" x2="0" y2="-40" stroke="#f2f0ea" stroke-width="3.2" stroke-linecap="round" />
          <line x1="0" y1="-41" x2="-3" y2="-52" stroke="#dcdad2" stroke-width="2.6" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <!-- AC Pilot Indicator Lamp Assembly (Placed in Right Margin at cx=1785, cy=154) -->
    <g id="ac-pilot-lamp" class="wbs-ac-pilot-lamp" transform="translate(1785, 154)" filter="url(#lampDropShadow)">
      <title>AC Mains Pilot Lamp ${isPowered ? '(Energized)' : '(Off)'}</title>
      <!-- Outer Chrome Mounting Collar / Nut -->
      <ellipse cx="-4" cy="-1" rx="17.5" ry="18.5" fill="url(#chromeBezelGrad)" stroke="#383c42" stroke-width="0.9" />
      <!-- Inner Bezel Step -->
      <ellipse cx="-1" cy="0" rx="13.5" ry="14.5" fill="#70767e" stroke="#2c3036" stroke-width="0.8" />
      <!-- Protruding Clear/Frosted Cylindrical Glass Jewel Lens -->
      <ellipse cx="5" cy="3" rx="11.5" ry="12.2" fill="${isPowered ? 'url(#lensOnGrad)' : 'url(#lensGrad)'}" stroke="#88909a" stroke-width="0.9" />
      ${isPowered ? `<circle cx="5" cy="3" r="16" fill="#f59e0b" opacity="0.32" filter="url(#xglow)" pointer-events="none" />` : ''}
      <!-- Internal Bulb Filament / Refractor Ring -->
      <ellipse cx="6" cy="3" rx="6.2" ry="6.8" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.85" />
      <circle cx="5" cy="2" r="2.8" fill="#ffffff" fill-opacity="0.9" />

      <!-- "AC" Panel Silkscreen Label -->
      <text x="0" y="38" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12.5" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="0.8">AC</text>
    </g>

    <!-- Lower Input 1 2 3 4 Wink Switch Selector Assembly Across the Bottom -->
    ${renderWinkSwitchCluster(isPowered)}
  </g>`;
}

export function renderWinkSwitchCluster(isPowered = true): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  const switches = [
    { num: 1, sub: 'MIC' },
    { num: 2, sub: 'LINE' },
    { num: 3, sub: 'DIGITAL' },
    { num: 4, sub: 'TEST GEN' }
  ];

  const y = 289;
  const bw = 92;
  const bh = 57;
  const gap = 18;
  const startX = 1389;

  let out = `
    <!-- INPUT SELECTOR Header & Hairline Rules -->
    <g ${font}>
      <line x1="1375" y1="270" x2="1525" y2="270" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
      <text x="1600" y="273.5" font-size="11" font-weight="700" fill="#2A2B2A" text-anchor="middle" letter-spacing="2.5">INPUT SELECTOR</text>
      <line x1="1675" y1="270" x2="1825" y2="270" stroke="#8C897B" stroke-width="1.2" stroke-opacity="0.8" />
    </g>
  `;

  switches.forEach((sw, idx) => {
    const x = startX + idx * (bw + gap);
    const i = sw.num;
    const cw = bw - 8;
    const ch = bh - 8;
    const cx = x + 4;
    const cy = y + 4;
    const midY = cy + ch / 2;

    out += `
      <!-- WINK SWITCH: INPUT ${i} -->
      <g class="xtm-btn wink-switch ${i === 1 ? 'wink-open' : ''}" id="wink_btn_${i}" data-btn="INPUT_${i}" data-input="${i}" style="cursor:pointer" role="button" tabindex="0" aria-label="Input ${i} (${sw.sub})">
        <title>Input ${i}: ${sw.sub} (Wink Selector Switch)</title>

        <!-- Silkscreen Header Above Button -->
        <text x="${x + bw / 2}" y="${y - 6}" ${font} font-size="9" font-weight="800" fill="#2A2B2A" text-anchor="middle" letter-spacing="1">INPUT ${i}</text>

        <!-- Button Outer Beveled Housing -->
        <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="#14171a" stroke="#2d333b" stroke-width="1.2" filter="url(#winkButtonShadow)" />
        <rect x="${x + 2}" y="${y + 2}" width="${bw - 4}" height="${bh - 4}" rx="3" fill="#0d0f12" />

        <!-- Shutter Aperture Recess with Clip Path -->
        <clipPath id="wink_clip_${i}">
          <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="3" />
        </clipPath>

        <g clip-path="url(#wink_clip_${i})">
          <!-- 1. Illuminated Active Neon Core (Revealed when eye winks open) -->
          <rect class="wink-neon-core" x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="${isPowered ? 'url(#winkNeonGrad)' : '#0f2416'}" ${isPowered ? 'filter="url(#winkGlow)"' : ''} />
          <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="none" stroke="#86efac" stroke-width="1" opacity="0.6" />

          <!-- Inside Illuminated Numeral & Label -->
          <text class="wink-text-inside" x="${cx + cw / 2}" y="${cy + 32}" ${font} font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.7))">${i}</text>
          <text class="wink-subtext-inside" x="${cx + cw / 2}" y="${cy + 43}" ${font} font-size="8" font-weight="800" fill="#dcfce7" text-anchor="middle" letter-spacing="1">${sw.sub}</text>

          <!-- 2. Mechanical Eyelids / Shutters (Slide open vertically from center) -->
          <!-- Top Shutter Blade -->
          <g class="wink-shutter-top">
            <rect x="${cx}" y="${cy}" width="${cw}" height="${ch / 2}" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${cx + 2}" y1="${cy + 1.5}" x2="${cx + cw - 2}" y2="${cy + 1.5}" stroke="#475569" stroke-width="0.8" stroke-opacity="0.6" />
          </g>

          <!-- Bottom Shutter Blade -->
          <g class="wink-shutter-bot">
            <rect x="${cx}" y="${midY}" width="${cw}" height="${ch / 2}" fill="url(#winkShutterGrad)" stroke="#111317" stroke-width="0.5" />
            <line x1="${cx + 2}" y1="${cy + ch - 1}" x2="${cx + cw - 2}" y2="${cy + ch - 1}" stroke="#0b0d10" stroke-width="0.8" />
          </g>

          <!-- Center Meeting Slit Line (Visible when closed) -->
          <line class="wink-slit-line" x1="${cx}" y1="${midY}" x2="${cx + cw}" y2="${midY}" stroke="#0a0c0f" stroke-width="1.2" />

          <!-- Inactive / Closed Numeral Etched on Shutter Surface -->
          <text class="wink-text-closed" x="${cx + cw / 2}" y="${cy + 34}" ${font} font-size="20" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="1">${i}</text>
        </g>

        <!-- 3. Convex Glass Lens Overlay with Specular Glint & Bezel Rim -->
        <rect class="wink-lens" x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="3" fill="url(#winkGlassLens)" pointer-events="none" />
        <path class="wink-glint" d="M ${cx + 4} ${cy + 2.5} L ${cx + cw - 4} ${cy + 2.5}" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" pointer-events="none" />
        <rect class="wink-bezel" x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="3" fill="none" stroke="url(#winkBezelGrad)" stroke-width="1.2" pointer-events="none" />

        <!-- Silkscreen Subtitle Label Below Switch -->
        <text x="${x + bw / 2}" y="${y + bh + 14}" ${font} font-size="9.5" font-weight="700" fill="#454C59" text-anchor="middle" letter-spacing="0.8">${sw.sub}</text>
      </g>
    `;
  });

  return out;
}
