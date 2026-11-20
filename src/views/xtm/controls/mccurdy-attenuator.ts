/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * McCurdy Radio Extended Range 31-Step Dual-Scale Attenuator (Model 023 / SA14023):
 * - Light-grey / warm ivory circular skirt base (r=95).
 * - 14-flute scalloped grip barrel (baseRadius=65.5, fluteDepth=2.6, 14 flutes) with molded groove lines.
 * - Cadmium yellow bezel ring with specular highlight & textured yellow cap disc.
 * - Solid black index pointer on skirt + hollow black pointer triangle on yellow cap.
 * - Dual-concentric 31-step scale ring (-50 to +10 inner, -30 to +30 outer).
 */

export function buildFlutedKnobPath(baseRadius: number, fluteDepth: number, fluteCount: number): string {
  const samples = fluteCount * 16;
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const theta = (i / samples) * Math.PI * 2 - Math.PI / 2;
    const r = baseRadius + fluteDepth * Math.cos(fluteCount * (theta + Math.PI / 2));
    const x = (r * Math.cos(theta)).toFixed(2);
    const y = (r * Math.sin(theta)).toFixed(2);
    d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
  }
  return d + ' Z';
}

export function renderMcCurdyDualScale(cx: number, cy: number, activeRange: 'low' | 'high' = 'low', color = '#edeae0'): string {
  const font = `font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"`;
  let s = `<g class="mccurdy-dual-scale" ${font} font-weight="700">`;

  // 31 detents: 337.5° total span = 11.25° per step (from -258.75° to +78.75°)
  // Click 15 = -90° (9 o'clock)
  for (let i = 0; i <= 30; i++) {
    const deg = -258.75 + i * 11.25;
    const rad = ((deg - 90) * Math.PI) / 180;
    const lowVal = -50 + i * 2;
    const highVal = -30 + i * 2;

    const lowStr = (lowVal > 0 ? '+' : '') + lowVal;
    const highStr = (highVal > 0 ? '+' : '') + highVal;

    // Tick lines
    const x1 = cx + 62 * Math.cos(rad);
    const y1 = cy + 62 * Math.sin(rad);
    const x2 = cx + 69.5 * Math.cos(rad);
    const y2 = cy + 69.5 * Math.sin(rad);

    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${i % 5 === 0 ? '1.8' : '1.1'}" />`;

    // Inner Scale Numbers (r=79.5)
    const inX = cx + 79.5 * Math.cos(rad);
    const inY = cy + 79.5 * Math.sin(rad);
    const inOpacity = activeRange === 'high' ? '1' : '0.45';
    s += `<text x="${inX.toFixed(1)}" y="${(inY + 3.5).toFixed(1)}" font-size="${Math.abs(highVal) >= 10 ? '9.5' : '10.5'}" fill="${color}" fill-opacity="${inOpacity}" text-anchor="middle">${highStr}</text>`;

    // Outer Scale Numbers (r=96.5)
    const outX = cx + 96.5 * Math.cos(rad);
    const outY = cy + 96.5 * Math.sin(rad);
    const outOpacity = activeRange === 'low' ? '1' : '0.45';
    s += `<text x="${outX.toFixed(1)}" y="${(outY + 3.5).toFixed(1)}" font-size="${Math.abs(lowVal) >= 10 ? '9.5' : '10.5'}" fill="${color}" fill-opacity="${outOpacity}" text-anchor="middle">${lowStr}</text>`;
  }

  s += `</g>`;
  return s;
}

export function renderMcCurdyAttenuatorKnob(cx: number, cy: number, angleDeg = -90): string {
  const flutePath = buildFlutedKnobPath(41.5, 2.0, 14);

  // 14 molded radial groove lines on barrel flutes
  let grooves = '';
  for (let i = 0; i < 14; i++) {
    const angle = (i * 360) / 14 + 360 / 28;
    const rad = (angle * Math.PI) / 180;
    grooves += `<line x1="${(36 * Math.cos(rad)).toFixed(2)}" y1="${(36 * Math.sin(rad)).toFixed(2)}" x2="${(41 * Math.cos(rad)).toFixed(2)}" y2="${(41 * Math.sin(rad)).toFixed(2)}" />`;
  }

  return `
    <g class="mccurdy-attenuator-assembly" filter="url(#mainKnobShadow)">
      <!-- Light-Grey Skirt Base Flange (r=60) -->
      <circle class="knob-skirt-disc" cx="${cx}" cy="${cy}" r="60" fill="url(#lightGreySkirt)" stroke="#85837a" stroke-width="1.1" />
      <circle cx="${cx}" cy="${cy}" r="43.5" fill="none" stroke="#9e9b91" stroke-width="0.9" />

      <!-- Concentric Rotor Group -->
      <g id="knob-main-rotor" transform="translate(${cx}, ${cy}) rotate(${angleDeg.toFixed(1)})">
        <!-- Solid Black Triangular Index Pointer Printed on Skirt -->
        <polygon points="0,-59.5 -7.5,-43.5 7.5,-43.5" fill="#141517" />

        <!-- 14-Flute Barrel Body -->
        <path id="knob-main-flutes" class="knob-flute-body" d="${flutePath}" fill="url(#lightGreyBarrel)" stroke="#626059" stroke-width="1.1" />
        <g id="knob-main-grooves" class="knob-flute-stripe" stroke="#78766e" stroke-width="0.95" stroke-linecap="round">
          ${grooves}
        </g>

        <!-- Raised Cadmium Yellow Bezel Ring & Highlight (r=36) -->
        <circle class="knob-yellow-rim" cx="0" cy="0" r="36" fill="url(#yellowRimGrad)" stroke="#8a6c08" stroke-width="1" />
        <path d="M -26,-24 A 35,35 0 0 1 26,-24" fill="none" stroke="#fff3a8" stroke-width="1.2" stroke-opacity="0.8" />

        <!-- Recessed Textured Yellow Cap (r=31.8) -->
        <circle class="knob-yellow-cap" cx="0" cy="0" r="31.8" fill="url(#yellowCapGrad)" stroke="#9c7a0b" stroke-width="0.9" />

        <!-- Hollow Black Triangle Pointer (Matching Vintage Hardware Photo) -->
        <polygon points="0,-29 -8.5,14 8.5,14" fill="none" stroke="#161719" stroke-width="2.6" stroke-linejoin="round" />
        <!-- Radial Line Index Axis -->
        <line x1="0" y1="-29" x2="0" y2="-3" stroke="#161719" stroke-width="1.5" stroke-linecap="round" />
      </g>
    </g>`;
}
