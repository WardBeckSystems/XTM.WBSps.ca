/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Realistic VU Meter Glass Shatter Overlay:
 * Renders an intricate spiderweb glass fracture pattern with sharp radial impact fissures,
 * jagged concentric fracture rings, and specular edge glints when the meter stays in the red.
 */

export function renderGlassShatter(cx: number, cy: number, id: number): string {
  // Impact epicenter: off-center right towards the +3 VU pin overload zone
  const ox = cx + 85;
  const oy = cy - 25;

  return `
    <!-- VU Meter Shattered Glass Fracture Overlay -->
    <g class="vu-glass-shatter" id="vu_shatter_${id}" style="display: none; pointer-events: none;">
      <!-- Subtle fractured glass desaturation / micro-crystalline veil -->
      <radialGradient id="shatterGlow_${id}" cx="${ox}" cy="${oy}" r="220" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="25%" stop-color="#ffffff" stop-opacity="0.18"/>
        <stop offset="60%" stop-color="#c8e4f5" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.0"/>
      </radialGradient>
      <circle cx="${ox}" cy="${oy}" r="210" fill="url(#shatterGlow_${id})"/>

      <!-- Primary Impact Center Crater -->
      <circle cx="${ox}" cy="${oy}" r="4.5" fill="#ffffff" opacity="0.9"/>
      <circle cx="${ox}" cy="${oy}" r="9" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.85"/>
      <circle cx="${ox}" cy="${oy}" r="15" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.7"/>

      <!-- Dark Crevice Fracture Shadows (Depth behind cracks) -->
      <g stroke="#05070a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" fill="none">
        <!-- Radial Spiderweb Crevices -->
        <path d="M ${ox} ${oy} L ${ox - 35} ${oy - 22} L ${ox - 85} ${oy - 38} L ${ox - 145} ${oy - 42} L ${ox - 220} ${oy - 65} L ${ox - 280} ${oy - 85}" />
        <path d="M ${ox} ${oy} L ${ox - 28} ${oy + 15} L ${ox - 72} ${oy + 48} L ${ox - 130} ${oy + 82} L ${ox - 195} ${oy + 115} L ${ox - 260} ${oy + 130}" />
        <path d="M ${ox} ${oy} L ${ox - 45} ${oy - 8} L ${ox - 110} ${oy - 12} L ${ox - 180} ${oy + 18} L ${ox - 250} ${oy + 35} L ${ox - 310} ${oy + 42}" />
        <path d="M ${ox} ${oy} L ${ox - 12} ${oy - 40} L ${ox - 35} ${oy - 75} L ${ox - 65} ${oy - 115} L ${ox - 95} ${oy - 145}" />
        <path d="M ${ox} ${oy} L ${ox + 25} ${oy - 28} L ${ox + 60} ${oy - 55} L ${ox + 95} ${oy - 80} L ${ox + 125} ${oy - 105}" />
        <path d="M ${ox} ${oy} L ${ox + 35} ${oy + 18} L ${ox + 75} ${oy + 42} L ${ox + 115} ${oy + 75} L ${ox + 145} ${oy + 110}" />
        <path d="M ${ox} ${oy} L ${ox + 18} ${oy + 38} L ${ox + 32} ${oy + 85} L ${ox + 45} ${oy + 135}" />
        <path d="M ${ox} ${oy} L ${ox - 18} ${oy + 42} L ${ox - 38} ${oy + 95} L ${ox - 62} ${oy + 145}" />

        <!-- Concentric Fractures -->
        <path d="M ${ox - 28} ${oy - 18} L ${ox - 35} ${oy - 6} L ${ox - 22} ${oy + 12} L ${ox + 15} ${oy + 14} L ${ox + 22} ${oy - 12} Z" />
        <path d="M ${ox - 65} ${oy - 30} L ${ox - 78} ${oy + 5} L ${ox - 52} ${oy + 38} L ${ox + 28} ${oy + 32} L ${ox + 55} ${oy - 22} L ${ox + 18} ${oy - 48} Z" />
        <path d="M ${ox - 125} ${oy - 36} L ${ox - 142} ${oy + 15} L ${ox - 105} ${oy + 68} L ${ox - 30} ${oy + 82} L ${ox + 62} ${oy + 36} L ${ox + 85} ${oy - 48} L ${ox - 25} ${oy - 72} Z" />
        <path d="M ${ox - 195} ${oy - 55} L ${ox - 215} ${oy + 28} L ${ox - 165} ${oy + 95} L ${ox - 75} ${oy + 125} L ${ox + 95} ${oy + 68} L ${ox + 118} ${oy - 75} L ${ox - 55} ${oy - 110} Z" />
      </g>

      <!-- Sharp White Specular Fractures & Cracks (Light-catching glass edges) -->
      <g stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none">
        <!-- Radial Cracks -->
        <path d="M ${ox} ${oy} L ${ox - 34} ${oy - 23} L ${ox - 84} ${oy - 39} L ${ox - 144} ${oy - 43} L ${ox - 219} ${oy - 66} L ${ox - 279} ${oy - 86}" />
        <path d="M ${ox} ${oy} L ${ox - 27} ${oy + 14} L ${ox - 71} ${oy + 47} L ${ox - 129} ${oy + 81} L ${ox - 194} ${oy + 114} L ${ox - 259} ${oy + 129}" />
        <path d="M ${ox} ${oy} L ${ox - 44} ${oy - 9} L ${ox - 109} ${oy - 13} L ${ox - 179} ${oy + 17} L ${ox - 249} ${oy + 34} L ${ox - 309} ${oy + 41}" />
        <path d="M ${ox} ${oy} L ${ox - 11} ${oy - 41} L ${ox - 34} ${oy - 76} L ${ox - 64} ${oy - 116} L ${ox - 94} ${oy - 146}" />
        <path d="M ${ox} ${oy} L ${ox + 26} ${oy - 27} L ${ox + 61} ${oy - 54} L ${ox + 96} ${oy - 79} L ${ox + 126} ${oy - 104}" />
        <path d="M ${ox} ${oy} L ${ox + 36} ${oy + 17} L ${ox + 76} ${oy + 41} L ${ox + 116} ${oy + 74} L ${ox + 146} ${oy + 109}" />
        <path d="M ${ox} ${oy} L ${ox + 19} ${oy + 37} L ${ox + 33} ${oy + 84} L ${ox + 46} ${oy + 134}" />
        <path d="M ${ox} ${oy} L ${ox - 17} ${oy + 41} L ${ox - 37} ${oy + 94} L ${ox - 61} ${oy + 144}" />

        <!-- Fine Micro-Fissures -->
        <path d="M ${ox - 45} ${oy - 8} L ${ox - 58} ${oy - 24} L ${ox - 72} ${oy - 28}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${ox - 110} ${oy - 12} L ${ox - 125} ${oy + 8} L ${ox - 148} ${oy + 14}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${ox - 72} ${oy + 48} L ${ox - 92} ${oy + 42} L ${ox - 118} ${oy + 52}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${ox + 35} ${oy + 18} L ${ox + 52} ${oy + 8} L ${ox + 78} ${oy + 6}" stroke-width="0.8" opacity="0.8" />
        <path d="M ${ox + 60} ${oy - 55} L ${ox + 82} ${oy - 45} L ${ox + 105} ${oy - 52}" stroke-width="0.8" opacity="0.8" />

        <!-- Concentric Fractures -->
        <path d="M ${ox - 27} ${oy - 19} L ${ox - 34} ${oy - 7} L ${ox - 21} ${oy + 11} L ${ox + 16} ${oy + 13} L ${ox + 23} ${oy - 13} Z" />
        <path d="M ${ox - 64} ${oy - 31} L ${ox - 77} ${oy + 4} L ${ox - 51} ${oy + 37} L ${ox + 29} ${oy + 31} L ${ox + 56} ${oy - 23} L ${ox + 19} ${oy - 49} Z" />
        <path d="M ${ox - 124} ${oy - 37} L ${ox - 141} ${oy + 14} L ${ox - 104} ${oy + 67} L ${ox - 29} ${oy + 81} L ${ox + 63} ${oy + 35} L ${ox + 86} ${oy - 49} L ${ox - 24} ${oy - 73} Z" />
        <path d="M ${ox - 194} ${oy - 56} L ${ox - 214} ${oy + 27} L ${ox - 164} ${oy + 94} L ${ox - 74} ${oy + 124} L ${ox + 96} ${oy + 67} L ${ox + 119} ${oy - 76} L ${ox - 54} ${oy - 111} Z" />
      </g>

      <!-- Specular Shard Highlights (Prismatic glass facets) -->
      <polygon points="${ox - 35},${oy - 22} ${ox - 85},${oy - 38} ${ox - 78},${oy + 5} ${ox - 45},${oy - 8}" fill="#ffffff" opacity="0.08"/>
      <polygon points="${ox + 25},${oy - 28} ${ox + 60},${oy - 55} ${ox + 55},${oy - 22} ${ox + 22},${oy - 12}" fill="#ffffff" opacity="0.12"/>
      <polygon points="${ox - 72},${oy + 48} ${ox - 130},${oy + 82} ${ox - 105},${oy + 68} ${ox - 52},${oy + 38}" fill="#ffffff" opacity="0.09"/>
    </g>
  `;
}
