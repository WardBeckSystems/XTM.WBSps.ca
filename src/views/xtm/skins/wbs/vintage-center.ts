/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems Vintage Centre Console (Ward-Beck.ca):
 * - Authentic enamel / warm grey front panel module with anodized top/bottom lip.
 * - Slotted nickel chassis mounting screws.
 * - DR Differential Decade / Vernier Dial Scale (-10..-50 left, +10..+30 right, sub-ticks 2,4,6,8).
 * - Skirted fluted Bakelite instrument knob with high-contrast white index line and pointer.
 * - AC jeweled pilot indicator lamp assembly with chrome collar and warm incandescent filament glow.
 */

export function renderVintageWbsCenter(isPowered = true): string {
  // Cassette bay: x: 1350..1850 (width 500), y: 16..414 (height 398)
  // Translation for hardware (knob at x=1530, y=215; AC lamp at x=1724, y=213)
  // From gemini-svg (8).svg origin (262, 184): dx = 1268, dy = 31
  return `<g class="wbs-ca-only" id="vintage-wbs-center">
    <!-- Main Cassette Panel Housing -->
    <rect x="1350" y="16" width="500" height="398" rx="10" fill="url(#panelGrad)" stroke="#1a1c1e" stroke-width="2.5" />
    
    <!-- Top Brushed / Anodized Chassis Lip -->
    <path d="M 1350 26 A 10 10 0 0 1 1360 16 H 1840 A 10 10 0 0 1 1850 26 V 48 H 1350 Z" fill="url(#topChassisGrad)" />
    <line x1="1350" y1="48" x2="1850" y2="48" stroke="#b8b6ae" stroke-width="1.2" />

    <!-- Corner Slotted Screws (Top Chassis Lip) -->
    <g transform="translate(1372, 32)">
      <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#525559" stroke="#383a3d" stroke-width="0.6" />
      <line x1="-3" y1="0" x2="3" y2="0" stroke="#222426" stroke-width="0.8" />
    </g>
    <g transform="translate(1828, 32)">
      <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#525559" stroke="#383a3d" stroke-width="0.6" />
      <line x1="-3" y1="0" x2="3" y2="0" stroke="#222426" stroke-width="0.8" />
    </g>

    <!-- Lower Panel Edge Highlight & Rim -->
    <line x1="1350" y1="382" x2="1850" y2="382" stroke="#9e9c94" stroke-width="1.2" />
    <path d="M 1350 382 H 1850 V 404 A 10 10 0 0 1 1840 414 H 1360 A 10 10 0 0 1 1350 404 Z" fill="#eceae4" />

    <!-- Corner Slotted Screws (Bottom Lip) -->
    <g transform="translate(1372, 398)">
      <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#525559" stroke="#383a3d" stroke-width="0.6" />
      <line x1="-2.5" y1="-1.5" x2="2.5" y2="1.5" stroke="#222426" stroke-width="0.8" />
    </g>
    <g transform="translate(1828, 398)">
      <ellipse cx="0" cy="0" rx="4.5" ry="2.2" fill="#525559" stroke="#383a3d" stroke-width="0.6" />
      <line x1="-1.5" y1="-2.5" x2="1.5" y2="2.5" stroke="#222426" stroke-width="0.8" />
    </g>

    <!-- Hardware Group: DR Dial Scale + Fluted Instrument Knob + AC Pilot Lamp -->
    <g transform="translate(1268, 31)">
      <!-- DR Differential Decade / Vernier Dial Scale & Markings (Center: x=262, y=184) -->
      <g id="dr-dial-scale" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" fill="#3a3936" stroke="#3a3936">
        <!-- Top Header "DR" and "- 0 +" -->
        <text x="262" y="72" font-size="13.5" font-weight="600" text-anchor="middle" stroke="none" letter-spacing="0.8">DR</text>
        <text x="249" y="88" font-size="12" font-weight="600" text-anchor="middle" stroke="none">–</text>
        <text x="262" y="89" font-size="12.5" font-weight="600" text-anchor="middle" stroke="none">0</text>
        <text x="275" y="88" font-size="12" font-weight="600" text-anchor="middle" stroke="none">+</text>

        <!-- Center Zero Index Line (0 deg) -->
        <g transform="translate(262, 184)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
        </g>

        <!-- LEFT SIDE SCALE (-10 to -50, every 36 deg per 10 units = 7.2 deg per 2 units) -->
        <!-- Major Ticks & Labels (-10, -20, -30, -40, -50) -->
        <g transform="translate(262, 184) rotate(-36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(36, 0, -100)">10</text>
        </g>
        <g transform="translate(262, 184) rotate(-72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(72, 0, -100)">20</text>
        </g>
        <g transform="translate(262, 184) rotate(-108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(108, 0, -100)">30</text>
        </g>
        <g transform="translate(262, 184) rotate(-144)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(144, 0, -100)">40</text>
        </g>
        <g transform="translate(262, 184) rotate(-180)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(180, 0, -100)">50</text>
        </g>

        <!-- Left Sub-Numerals (2, 4, 6, 8 between each major division) -->
        <g font-size="7.5" font-weight="600" text-anchor="middle" stroke="none" fill="#52504c">
          <!-- 0 to -10 -->
          <text x="251" y="99">2</text>
          <text x="240" y="101">4</text>
          <text x="229" y="104">6</text>
          <text x="219" y="109">8</text>
          <!-- -10 to -20 -->
          <text x="200" y="121">2</text>
          <text x="192" y="129">4</text>
          <text x="186" y="138">6</text>
          <text x="180" y="148">8</text>
          <!-- -20 to -30 -->
          <text x="174" y="170">2</text>
          <text x="173" y="181">4</text>
          <text x="173" y="192">6</text>
          <text x="175" y="203">8</text>
          <!-- -30 to -40 -->
          <text x="182" y="224">2</text>
          <text x="188" y="234">4</text>
          <text x="195" y="243">6</text>
          <text x="203" y="251">8</text>
          <!-- -40 to -50 -->
          <text x="222" y="263">2</text>
          <text x="232" y="268">4</text>
          <text x="242" y="271">6</text>
          <text x="252" y="273">8</text>
        </g>

        <!-- RIGHT SIDE SCALE (+10 to +30, every 36 deg per 10 units) -->
        <!-- Major Ticks & Labels (+10, +20, +30) -->
        <g transform="translate(262, 184) rotate(36)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(-36, 0, -100)">10</text>
        </g>
        <g transform="translate(262, 184) rotate(72)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(-72, 0, -100)">20</text>
        </g>
        <g transform="translate(262, 184) rotate(108)">
          <line x1="0" y1="-72" x2="0" y2="-91" stroke-width="1.6" />
          <text x="0" y="-96" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(-108, 0, -100)">30</text>
        </g>

        <!-- Right Sub-Numerals (2, 4, 6, 8 between major divisions) -->
        <g font-size="7.5" font-weight="600" text-anchor="middle" stroke="none" fill="#52504c">
          <!-- 0 to +10 -->
          <text x="273" y="99">2</text>
          <text x="284" y="101">4</text>
          <text x="295" y="104">6</text>
          <text x="305" y="109">8</text>
          <!-- +10 to +20 -->
          <text x="324" y="121">2</text>
          <text x="332" y="129">4</text>
          <text x="338" y="138">6</text>
          <text x="344" y="148">8</text>
          <!-- +20 to +30 -->
          <text x="350" y="170">2</text>
          <text x="351" y="181">4</text>
          <text x="351" y="192">6</text>
          <text x="349" y="203">8</text>
        </g>
      </g>

      <!-- Skirted Fluted Instrument Knob (Centered at x=262, y=184) -->
      <g id="instrument-knob" class="xtm-btn wbs-vintage-knob" style="cursor:pointer;" filter="url(#knobDropShadow)">
        <title>Ward-Beck DR Vernier Attenuator (Click to Rotate)</title>
        <!-- Outer Skirt Base Disc -->
        <circle cx="262" cy="184" r="76" fill="url(#skirtGrad)" stroke="#090a0b" stroke-width="1.2" />
        <!-- Subtle Specular Rim Highlight on Skirt -->
        <path d="M 192,154 A 76,76 0 0 1 324,140" fill="none" stroke="#52565c" stroke-width="1.1" stroke-opacity="0.65" />

        <!-- White Triangular Pointer on Skirt (Pointing to ~ +4.2 on right scale = +15 deg) -->
        <g id="wbs_vintage_knob_pointer" transform="translate(262, 184) rotate(15)">
          <polygon points="0,-74 -8.5,-54 8.5,-54" fill="#eceae2" stroke="#18191b" stroke-width="0.6" />
        </g>

        <!-- 3D Extruded Fluted Barrel (Shifted slightly down-right to show perspective depth) -->
        <g id="wbs_vintage_knob_rotor" transform="translate(269, 193) rotate(15)">
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

      <!-- AC Pilot Indicator Lamp Assembly (Centered at x=456, y=182) -->
      <g id="ac-pilot-lamp" class="wbs-ac-pilot-lamp" filter="url(#lampDropShadow)">
        <title>AC Mains Pilot Lamp ${isPowered ? '(Energized)' : '(Off)'}</title>
        <!-- Outer Chrome Mounting Collar / Nut -->
        <ellipse cx="452" cy="181" rx="17.5" ry="18.5" fill="url(#chromeBezelGrad)" stroke="#383c42" stroke-width="0.9" />
        <!-- Inner Bezel Step -->
        <ellipse cx="455" cy="182" rx="13.5" ry="14.5" fill="#70767e" stroke="#2c3036" stroke-width="0.8" />
        <!-- Protruding Clear/Frosted Cylindrical Glass Jewel Lens -->
        <ellipse cx="461" cy="185" rx="11.5" ry="12.2" fill="${isPowered ? 'url(#lensOnGrad)' : 'url(#lensGrad)'}" stroke="#88909a" stroke-width="0.9" />
        ${isPowered ? `<circle cx="461" cy="185" r="16" fill="#f59e0b" opacity="0.32" filter="url(#xglow)" pointer-events="none" />` : ''}
        <!-- Internal Bulb Filament / Refractor Ring -->
        <ellipse cx="462" cy="185" rx="6.2" ry="6.8" fill="none" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.85" />
        <circle cx="461" cy="184" r="2.8" fill="#ffffff" fill-opacity="0.9" />

        <!-- "AC" Panel Silkscreen Label -->
        <text x="456" y="220" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="12.5" font-weight="600" fill="#3a3936" text-anchor="middle" letter-spacing="0.6">AC</text>
      </g>
    </g>
  </g>`;
}
