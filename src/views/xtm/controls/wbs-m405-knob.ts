/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.com - Ward-Beck.ca). All rights reserved. */
/**
 * Ward-Beck Systems M405 Skirted Fluted Rotary Attenuator Knob & Dial:
 * - Vintage black Bakelite skirted flange (r=71).
 * - 14-flute scalloped barrel body (r=44).
 * - Glossy cap disc with high-visibility pointer line and index triangle.
 * - Precision RANGE scale (- 0 +, 10..50 left, 10..30 right, with 2,4,6,8 subdivisions)
 *   matching Ward-Beck M405 console engineering schematics.
 */

export function renderWbsM405Scale(cx: number, cy: number, color = '#3a3936'): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  let s = `<g class="wbs-m405-scale" ${font} fill="${color}" stroke="${color}">
      <text x="${cx}" y="${cy - 112}" font-size="13.5" font-weight="700" text-anchor="middle" stroke="none" letter-spacing="1">RANGE</text>
      <text x="${cx - 13}" y="${cy - 96}" font-size="12" font-weight="600" text-anchor="middle" stroke="none">–</text>
      <text x="${cx}" y="${cy - 95}" font-size="12.5" font-weight="700" text-anchor="middle" stroke="none">0</text>
      <text x="${cx + 13}" y="${cy - 96}" font-size="12" font-weight="600" text-anchor="middle" stroke="none">+</text>

      <!-- Center Zero Index Line -->
      <g transform="translate(${cx}, ${cy})">
        <line x1="0" y1="-68" x2="0" y2="-86" stroke-width="1.8" />
      </g>`;

  // Left Major Ticks & Labels (-10 to -50)
  const leftAngles = [
    { deg: -36, label: '10' },
    { deg: -72, label: '20' },
    { deg: -108, label: '30' },
    { deg: -144, label: '40' },
    { deg: -180, label: '50' }
  ];

  leftAngles.forEach(({ deg, label }) => {
    s += `
      <g transform="translate(${cx}, ${cy}) rotate(${deg})">
        <line x1="0" y1="-68" x2="0" y2="-86" stroke-width="1.6" />
        <text x="0" y="-91" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(${-deg}, 0, -95)">${label}</text>
      </g>`;
  });

  // Right Major Ticks & Labels (+10 to +30)
  const rightAngles = [
    { deg: 36, label: '10' },
    { deg: 72, label: '20' },
    { deg: 108, label: '30' }
  ];

  rightAngles.forEach(({ deg, label }) => {
    s += `
      <g transform="translate(${cx}, ${cy}) rotate(${deg})">
        <line x1="0" y1="-68" x2="0" y2="-86" stroke-width="1.6" />
        <text x="0" y="-91" font-size="12" font-weight="600" text-anchor="middle" stroke="none" transform="rotate(${-deg}, 0, -95)">${label}</text>
      </g>`;
  });

  // Subdivision Dots (2, 4, 6, 8)
  for (let d = -172.8; d <= 108; d += 7.2) {
    if (Math.abs(d % 36) > 2) {
      s += `
        <g transform="translate(${cx}, ${cy}) rotate(${d.toFixed(1)})">
          <circle cx="0" cy="-77" r="1.4" stroke="none" fill="${color}" opacity="0.8"/>
        </g>`;
    }
  }

  s += `
      <text x="${cx}" y="${cy + 104}" font-size="11.5" font-weight="600" text-anchor="middle" stroke="none" fill="${color}" letter-spacing="0.5">(dBm)</text>
    </g>`;

  return s;
}

export function renderWbsM405Knob(cx: number, cy: number, angleDeg = 0): string {
  return `
    <g class="wbs-m405-knob-assembly" filter="url(#knobDropShadow)">
      <!-- Skirt Base Flange -->
      <circle cx="${cx}" cy="${cy}" r="71" fill="url(#skirtGrad)" stroke="#090a0b" stroke-width="1.2" />
      <path d="M ${cx - 65},${cy - 28} A 71,71 0 0 1 ${cx + 58},${cy - 41}" fill="none" stroke="#52565c" stroke-width="1.1" stroke-opacity="0.65" />

      <!-- Fixed Index Arrow Triangle on Housing -->
      <g transform="translate(${cx}, ${cy})">
        <polygon points="0,-69 -7,-52 7,-52" fill="#eceae2" stroke="#18191b" stroke-width="0.8" />
      </g>

      <!-- Rotating Fluted Knob Barrel & Cap Assembly -->
      <g class="wbs-m405-knob-rotor" transform="translate(${cx}, ${cy}) rotate(${angleDeg.toFixed(1)})">
        <!-- Fluted Knob Barrel -->
        <g fill="url(#knobBodyGrad)" stroke="#0b0c0d" stroke-width="0.8">
          <circle cx="0" cy="0" r="44" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(0)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(25.7)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(51.4)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(77.1)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(102.8)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(128.5)" />
          <rect x="-4.8" y="-47" width="9.6" height="94" rx="3.8" transform="rotate(154.2)" />
        </g>
        <!-- Glossy Face Cap Disc -->
        <circle cx="0" cy="0" r="38" fill="url(#knobCapGrad)" stroke="#070809" stroke-width="1.2" />
        <!-- Top Reflection Arc -->
        <path d="M -30,-22 A 37,37 0 0 1 32,-18" fill="none" stroke="#686d75" stroke-width="1.2" />
        <!-- Needle Pointer Line & Scallop Tip -->
        <line x1="0" y1="3" x2="0" y2="-37" stroke="#f2f0ea" stroke-width="3" stroke-linecap="round" />
        <line x1="0" y1="-38" x2="0" y2="-48" stroke="#dcdad2" stroke-width="2.4" stroke-linecap="round" />
      </g>
    </g>`;
}
