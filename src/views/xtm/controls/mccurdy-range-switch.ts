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
  const activeColor = '#facc15';

  return `
    <g class="mccurdy-range-switch-assembly">
      <!-- RANGE SWITCH Header & Position Labels (Positioned Directly Below the Big Knob) -->
      <g ${font} font-weight="700">
        <text x="${cx}" y="${cy - 54}" font-size="11.5" fill="${color}" text-anchor="middle" letter-spacing="0.8">RANGE SWITCH</text>
        <text x="${cx - 48}" y="${cy - 38}" font-size="10.8" fill="${!isHighRange ? activeColor : color}" fill-opacity="${!isHighRange ? '1' : '0.5'}" text-anchor="middle" letter-spacing="0.5">-50 TO +10</text>
        <text x="${cx + 48}" y="${cy - 38}" font-size="10.8" fill="${isHighRange ? activeColor : color}" fill-opacity="${isHighRange ? '1' : '0.5'}" text-anchor="middle" letter-spacing="0.5">-30 TO +30</text>

        <!-- Silkscreened Routing Lines Going UP into the Dual Scales Above -->
        <path d="M ${cx - 16},${cy - 22} L ${cx - 24},${cy - 32} L ${cx - 38},${cy - 32} A 18,18 0 0 1 ${cx - 50},${cy - 48} L ${cx - 50},${cy - 68}"
              fill="none" stroke="${!isHighRange ? activeColor : color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              stroke-opacity="${!isHighRange ? '1' : '0.45'}" />
        <path d="M ${cx + 16},${cy - 22} L ${cx + 24},${cy - 32} L ${cx + 36},${cy - 32} A 18,18 0 0 0 ${cx + 34},${cy - 48} L ${cx + 34},${cy - 68}"
              fill="none" stroke="${isHighRange ? activeColor : color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
              stroke-opacity="${isHighRange ? '1' : '0.45'}" />
      </g>

      <!-- Knob Body Assembly -->
      <g filter="url(#smallKnobShadow)">
        <circle cx="${cx}" cy="${cy}" r="32" fill="url(#lightGreySkirt)" stroke="#8c8a81" stroke-width="1.1" />
        <circle cx="${cx}" cy="${cy}" r="24" fill="none" stroke="#9e9b91" stroke-width="0.9" />

        <!-- Parallax Rotor -->
        <g transform="translate(${(cx - 2.2).toFixed(1)}, ${(cy + 3.2).toFixed(1)})">
          <g transform="rotate(${angleDeg})">
            <!-- Small Barrel Body (r=22) -->
            <circle cx="0" cy="0" r="22" fill="url(#lightGreyBarrel)" stroke="#68665f" stroke-width="1.0" />
            <line x1="0" y1="-17" x2="0" y2="-23" stroke="#42413d" stroke-width="2.0" stroke-linecap="round" />

            <!-- Yellow Bezel & Cap (r=18 / 15.5) -->
            <g transform="translate(-1.2, 1.8)">
              <circle cx="0" cy="0" r="18" fill="url(#yellowRimGrad)" stroke="#8a6c08" stroke-width="1.0" />
              <circle cx="0" cy="0" r="15.5" fill="url(#yellowCapGrad)" stroke="#9c7a0b" stroke-width="1.0" />
              <!-- Hollow Black Triangle Pointer -->
              <polygon points="0,-15 -5,8 5,8" fill="none" stroke="#161719" stroke-width="2.0" stroke-linejoin="round" />
            </g>
          </g>
        </g>
      </g>
    </g>`;
}
