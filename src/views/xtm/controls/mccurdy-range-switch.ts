/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio 2-Position Range Switch Selector (Model 023 / SA14023):
 * - Small fluted light-grey skirt & yellow cap (r=43 / 24).
 * - Toggles between -35 deg (-50 TO +10) and +35 deg (-30 TO +30).
 * - Silkscreened routing lines and index ticks connecting switch detents to dual scales.
 */

export function renderMcCurdyRangeSwitch(cx: number, cy: number, isHighRange = false, color = '#edeae0'): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  const angleDeg = isHighRange ? 35 : -35;

  return `
    <g class="mccurdy-range-switch-assembly">
      <!-- RANGE SWITCH Header & Position Labels -->
      <g ${font} font-weight="700">
        <text x="${cx}" y="${cy - 98}" font-size="13.5" fill="${color}" text-anchor="middle" letter-spacing="0.9">RANGE SWITCH</text>
        <text x="${cx - 83}" y="${cy - 74}" font-size="13" fill="${color}" fill-opacity="${!isHighRange ? '1' : '0.5'}" text-anchor="middle" letter-spacing="0.6">-50 TO +10</text>
        <text x="${cx + 84}" y="${cy - 74}" font-size="13" fill="${color}" fill-opacity="${isHighRange ? '1' : '0.5'}" text-anchor="middle" letter-spacing="0.6">-30 TO +30</text>

        <!-- Silkscreened Routing Lines to Inner (-50 TO +10) and Outer (-30 TO +30) Scales -->
        <path d="M ${cx - 24},${cy - 35} L ${cx - 33},${cy - 48} A 58,58 0 0 0 ${cx - 58},${cy - 11} L ${cx - 152},${cy - 11}"
              fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              stroke-opacity="${!isHighRange ? '1' : '0.4'}" />
        <path d="M ${cx + 24},${cy - 35} L ${cx + 33},${cy - 48} A 58,58 0 0 1 ${cx + 21},${cy + 54} L ${cx + 16},${cy + 44} A 47,47 0 0 0 ${cx - 26},${cy + 33} L ${cx - 174},${cy + 33} L ${cx - 174},${cy + 50} L ${cx - 190},${cy + 50}"
              fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              stroke-opacity="${isHighRange ? '1' : '0.4'}" />
      </g>

      <!-- Knob Body Assembly -->
      <g filter="url(#smallKnobShadow)">
        <circle cx="${cx}" cy="${cy}" r="43" fill="url(#lightGreySkirt)" stroke="#8c8a81" stroke-width="1.1" />
        <circle cx="${cx}" cy="${cy}" r="32" fill="none" stroke="#9e9b91" stroke-width="1" />

        <!-- Parallax Rotor -->
        <g transform="translate(${(cx - 3.2).toFixed(1)}, ${(cy + 4.8).toFixed(1)})">
          <g transform="rotate(${angleDeg})">
            <!-- Small Barrel Body (r=29) -->
            <circle cx="0" cy="0" r="29" fill="url(#lightGreyBarrel)" stroke="#68665f" stroke-width="1.1" />
            <line x1="0" y1="-23" x2="0" y2="-30" stroke="#42413d" stroke-width="2.2" stroke-linecap="round" />

            <!-- Yellow Bezel & Cap (r=24 / 20.5) -->
            <g transform="translate(-1.8, 2.5)">
              <circle cx="0" cy="0" r="24" fill="url(#yellowRimGrad)" stroke="#8a6c08" stroke-width="1.1" />
              <circle cx="0" cy="0" r="20.5" fill="url(#yellowCapGrad)" stroke="#9c7a0b" stroke-width="1.1" />
              <!-- Hollow Black Triangle Pointer -->
              <polygon points="0,-20 -6.2,10.5 6.2,10.5" fill="none" stroke="#161719" stroke-width="2.2" stroke-linejoin="round" />
            </g>
          </g>
        </g>
      </g>
    </g>`;
}
