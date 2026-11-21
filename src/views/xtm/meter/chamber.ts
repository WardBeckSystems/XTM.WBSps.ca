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
  const bx = x0 - 14;
  const by = y0 - 16;
  const bw = MW + 28; // 608
  const bh = MH + 68; // 358 (ends at y=407, well above bottom extrusion 410.5)
  const seamY = y0 + MH + 10; // 365
  const screwY = y0 + MH + 33; // 388

  // Molded housing path with hollow window aperture (evenodd fill rule)
  const housingPath = `M ${bx + 10} ${by} h ${bw - 20} a 10 10 0 0 1 10 10 v ${bh - 20} a 10 10 0 0 1 -10 10 h -${bw - 20} a 10 10 0 0 1 -10 -10 v -${bh - 20} a 10 10 0 0 1 10 -10 Z M ${x0 + 6} ${y0} h ${MW - 12} a 6 6 0 0 1 6 6 v ${MH - 12} a 6 6 0 0 1 -6 6 h -${MW - 12} a 6 6 0 0 1 -6 -6 v -${MH - 12} a 6 6 0 0 1 6 -6 Z`;

  return `
    <!-- Modern Sleek Bezel (Ward-Beck.com / McCurdyRadio.com) -->
    <g class="modern-bezel">
      <path d="M${x0 - 4} ${y0 + MH - 24} L${x0 - 4} ${y0 + MH - 18} A24 24 0 0 0 ${x0 + 18} ${y0 + MH + 4} L${x0 + MW - 18} ${y0 + MH + 4} A24 24 0 0 0 ${x0 + MW + 4} ${y0 + MH - 18} L${x0 + MW + 4} ${y0 + MH - 24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
      <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
      <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>
    </g>

    <!-- Vintage 3D Molded Bakelite Bezel Housing with Lower Skirt & Zero Trimmer (Ward-Beck.ca & McCurdyRadio.ca) -->
    <g class="vintage-bezel-3d">
      <!-- Molded Housing Body with Transparent Window Cutout -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.8" d="${housingPath}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${bx + 14} ${by + 2} L ${bx + bw - 14} ${by + 2}" stroke="#484d56" stroke-width="1.4" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${bx + 5}" y="${by + 5}" width="${bw - 10}" height="${bh - 10}" rx="8" fill="none" stroke="#25272c" stroke-width="1.0" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="6" fill="none" stroke="#08090b" stroke-width="2.5" pointer-events="none"/>
      <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="5" fill="none" stroke="#2b2e34" stroke-width="1.4" stroke-opacity="0.8" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${bx + 2}" y1="${seamY}" x2="${bx + bw - 2}" y2="${seamY}" stroke="#0c0d0f" stroke-width="2" pointer-events="none"/>
      <line x1="${bx + 2}" y1="${seamY + 1.8}" x2="${bx + bw - 2}" y2="${seamY + 1.8}" stroke="#2c2f36" stroke-width="1.1" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly at Bottom Center -->
      <g class="trim-screw-interactive" transform="translate(${cx}, ${screwY})">
        <circle cx="0" cy="0" r="15" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.2"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="12.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.0"/>
          <rect x="-10.8" y="-1.8" width="21.6" height="3.6" rx="0.8" fill="#090a0c"/>
          <line x1="-10.2" y1="2.0" x2="10.2" y2="2.0" stroke="#4e525b" stroke-width="0.7"/>
        </g>
      </g>

      <!-- Four Corner Molded Bezel Slotted Screws -->
      <g transform="translate(${bx + 12}, ${by + 12})">
        <circle cx="0" cy="0" r="5" fill="#08090a" stroke="#1d1f23" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="3.6" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7"/>
        <line x1="-1.8" y1="-1.5" x2="1.8" y2="1.5" stroke="#060708" stroke-width="1.3" stroke-linecap="round"/>
      </g>
      <g transform="translate(${bx + bw - 12}, ${by + 12})">
        <circle cx="0" cy="0" r="5" fill="#08090a" stroke="#1d1f23" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="3.6" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7"/>
        <line x1="-1.8" y1="1.5" x2="1.8" y2="-1.5" stroke="#060708" stroke-width="1.3" stroke-linecap="round"/>
      </g>
      <g transform="translate(${bx + 12}, ${by + bh - 12})">
        <circle cx="0" cy="0" r="5" fill="#08090a" stroke="#1d1f23" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="3.6" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7"/>
        <line x1="-2.1" y1="-1.0" x2="2.1" y2="1.0" stroke="#060708" stroke-width="1.3" stroke-linecap="round"/>
      </g>
      <g transform="translate(${bx + bw - 12}, ${by + bh - 12})">
        <circle cx="0" cy="0" r="5" fill="#08090a" stroke="#1d1f23" stroke-width="0.8"/>
        <circle cx="0" cy="0" r="3.6" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7"/>
        <line x1="-1.5" y1="1.8" x2="1.5" y2="-1.8" stroke="#060708" stroke-width="1.3" stroke-linecap="round"/>
      </g>
    </g>`;
}
