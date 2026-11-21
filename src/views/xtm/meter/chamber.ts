/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Meter chamber: recess shadow gradients, recess shadow overlay and molded bezel rim. */
import { MW, MH } from '../layout/wbs-layout';

export const CHAMBER_GRADIENTS = `<linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.68"/>
          <stop offset="45%" stop-color="#000000" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="50%" stop-color="#000000" stop-opacity="0.20"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="xch_left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.50"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="xch_right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.50"/>
        </linearGradient>
        <linearGradient id="meterGlassSheenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.10"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.02"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <!-- Outer Molded Bakelite / ABS Bezel Gradient -->
        <linearGradient id="bezelMoldedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a2c31" />
          <stop offset="6%" stop-color="#1e2024" />
          <stop offset="50%" stop-color="#16171a" />
          <stop offset="94%" stop-color="#111214" />
          <stop offset="100%" stop-color="#0a0a0c" />
        </linearGradient>
        <!-- Inner Recessed Window Stepped Bezel -->
        <linearGradient id="bezelInnerStepGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0b0c0e" />
          <stop offset="85%" stop-color="#1a1c20" />
          <stop offset="100%" stop-color="#2c2f35" />
        </linearGradient>
        <!-- Trimmer Screw Head Radial Gradient -->
        <radialGradient id="trimScrewHeadGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#3c4048" />
          <stop offset="45%" stop-color="#23262b" />
          <stop offset="80%" stop-color="#141518" />
          <stop offset="100%" stop-color="#0a0b0d" />
        </radialGradient>
        <!-- Four Corner Molded Bezel Screws -->
        <radialGradient id="mcScrewGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#555861"/>
          <stop offset="45%" stop-color="#2d2f34"/>
          <stop offset="85%" stop-color="#18191c"/>
          <stop offset="100%" stop-color="#0b0c0d"/>
        </radialGradient>`;

/** Chamber recess shadows; also closes the clip group opened by the face. */
export function chamberShadows(x0: number, y0: number): string {
  return `
      <!-- Recessed Chamber Inner Glass Shadows -->
      <rect x="${x0}" y="${y0}" width="${MW}" height="28" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${x0}" y="${y0 + MH - 28}" width="${MW}" height="28" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${x0}" y="${y0}" width="20" height="${MH}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${x0 + MW - 20}" y="${y0}" width="20" height="${MH}" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${x0 + 1}" y="${y0 + 1}" width="${MW - 2}" height="${MH - 2}" rx="5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen -->
      <path d="M ${x0 + 6} ${y0 + 6} L ${x0 + MW * 0.72} ${y0 + 6} L ${x0 + 6} ${y0 + MH * 0.82} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${x0 + 6}" y="${(y0 + MH * 0.44).toFixed(1)}" width="${MW - 12}" height="1.6" fill="#ffffff" opacity="0.06" pointer-events="none"/>
    </g>`;
}

/** 
 * Bezel assembly:
 * - Sleek modern hairline rim for Ward-Beck.com (.modern-bezel)
 * - 3D molded Bakelite bezel with lower skirt, horizontal seam & trimmer screw for Ward-Beck.ca & McCurdyRadio.ca (.vintage-bezel-3d)
 * Outer frame cutout has fill-rule="evenodd" so the meter aperture is 100% open and dials remain visible.
 */
export function bezelRim(x0: number, y0: number, cx: number = x0 + MW / 2): string {
  // Outer molded Bakelite bezel housing geometry (scaled to match vintage Simpson / McCurdy reference proportions)
  const bx = cx - 304; // 608 wide, matches XTM front panel bay
  const by = 47;
  const bw = 608;
  const bh = 360; // ends at y=407, clear of bottom rail extrusion 410.5
  const br = 14;

  // Vintage window aperture geometry (proportions matching uploaded reference: window height ~59% of bezel height)
  const wx = cx - 274; // 548 wide, leaves 30px side borders (~5% of bw)
  const wy = 65;
  const ww = 548;
  const wh = 212; // ends at y=277, framing dial graphics with lower needle entrance
  const wr = 7;
  const winBot = wy + wh; // 277

  // Lower skirt geometry (skirt height ~54% of window height; seam separates window from skirt)
  const seamY = 292; // 15px ridge below window
  const screwY = 344; // vertically centered in 115px skirt (45.2% from seam to bottom)

  // Molded housing body with hollow window aperture (evenodd fill rule so dial face remains completely visible)
  const housingPath = `M ${bx + br} ${by} h ${bw - 2 * br} a ${br} ${br} 0 0 1 ${br} ${br} v ${bh - 2 * br} a ${br} ${br} 0 0 1 -${br} ${br} h -${bw - 2 * br} a ${br} ${br} 0 0 1 -${br} -${br} v -${bh - 2 * br} a ${br} ${br} 0 0 1 ${br} -${br} Z M ${wx + wr} ${wy} h ${ww - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} ${wr} v ${wh - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} ${wr} h -${ww - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} -${wr} v -${wh - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} -${wr} Z`;

  return `
    <!-- Modern Sleek Bezel (Ward-Beck.com / McCurdyRadio.com) -->
    <g class="modern-bezel">
      <path d="M${x0 - 4} ${y0 + MH - 24} L${x0 - 4} ${y0 + MH - 18} A24 24 0 0 0 ${x0 + 18} ${y0 + MH + 4} L${x0 + MW - 18} ${y0 + MH + 4} A24 24 0 0 0 ${x0 + MW + 4} ${y0 + MH - 18} L${x0 + MW + 4} ${y0 + MH - 24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
      <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
      <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>
    </g>

    <!-- Vintage 3D Molded Bakelite Bezel Housing with Lower Skirt & Zero Trimmer (Ward-Beck.ca & McCurdyRadio.ca) -->
    <g class="vintage-bezel-3d">
      <!-- Molded Housing Body with Transparent Window Cutout (Bakelite Apron covers needle base) -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.8" d="${housingPath}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${bx + 16} ${by + 2} L ${bx + bw - 16} ${by + 2}" stroke="#484d56" stroke-width="1.4" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${bx + 6}" y="${by + 6}" width="${bw - 12}" height="${bh - 12}" rx="${br - 3}" fill="none" stroke="#25272c" stroke-width="1.0" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${wx - 2}" y="${wy - 2}" width="${ww + 4}" height="${wh + 4}" rx="${wr + 2}" fill="none" stroke="#08090b" stroke-width="2.5" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${wr}" fill="none" stroke="#2b2e34" stroke-width="1.4" stroke-opacity="0.85" pointer-events="none"/>

      <!-- Window Inner Shadows & Specular Glass Reflection Sheen -->
      <rect x="${wx}" y="${wy}" width="${ww}" height="22" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${wx}" y="${winBot - 18}" width="${ww}" height="18" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="16" height="${wh}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${wx + ww - 16}" y="${wy}" width="16" height="${wh}" fill="url(#xch_right)" pointer-events="none"/>
      <path d="M ${wx + 6} ${wy + 6} L ${wx + ww * 0.65} ${wy + 6} L ${wx + 6} ${winBot - 12} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${wx + 6}" y="${(wy + wh * 0.42).toFixed(1)}" width="${ww - 12}" height="1.6" fill="#ffffff" opacity="0.06" pointer-events="none"/>

      <!-- Needle Movement Hub Cowl at Bottom Center of Window Aperture -->
      <path d="M ${cx - 26} ${winBot} A 26 26 0 0 1 ${cx + 26} ${winBot} Z" fill="#14161a" stroke="#2c2f36" stroke-width="1.4" pointer-events="none"/>
      <path d="M ${cx - 17} ${winBot} A 17 17 0 0 1 ${cx + 17} ${winBot} Z" fill="#0a0b0d" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${bx + 2}" y1="${seamY}" x2="${bx + bw - 2}" y2="${seamY}" stroke="#0c0d0f" stroke-width="2.0" pointer-events="none"/>
      <line x1="${bx + 2}" y1="${seamY + 1.8}" x2="${bx + bw - 2}" y2="${seamY + 1.8}" stroke="#2c2f36" stroke-width="1.1" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt (No Corner Screws) -->
      <g class="trim-screw-interactive" transform="translate(${cx}, ${screwY})">
        <circle cx="0" cy="0" r="18" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="16.5" fill="none" stroke="#08090a" stroke-width="0.9"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="14.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.1"/>
          <rect x="-12.5" y="-2.0" width="25" height="4.0" rx="0.9" fill="#090a0c"/>
          <line x1="-11.8" y1="2.1" x2="11.8" y2="2.1" stroke="#4e525b" stroke-width="0.8"/>
        </g>
      </g>
    </g>`;
}
