/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Meter chamber: recess shadow gradients, glass sheen reflection overlay,
 * and high-fidelity 3D molded Bakelite bezel with trimmer screws and corner screws.
 */
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
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.26"/>
          <stop offset="30%" stop-color="#ffffff" stop-opacity="0.10"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.02"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>`;

/** Chamber recess shadows; also closes the clip group opened by the face. */
export function chamberShadows(x0: number, y0: number): string {
  return `
      <!-- Recessed Chamber Inner Glass Shadows -->
      <rect x="${x0}" y="${y0}" width="${MW}" height="24" fill="url(#windowTopShadow)" pointer-events="none"/>
      <rect x="${x0}" y="${y0 + MH - 32}" width="${MW}" height="32" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${x0}" y="${y0}" width="24" height="${MH}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${x0 + MW - 24}" y="${y0}" width="24" height="${MH}" fill="url(#xch_right)" pointer-events="none"/>
      <rect x="${x0 + 1}" y="${y0 + 1}" width="${MW - 2}" height="${MH - 2}" rx="5" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2.5" pointer-events="none"/>
      <!-- Diagonal Specular Glass Reflection Sheen & Horizon Glare Layer -->
      <polygon points="${x0},${y0} ${x0 + MW * 0.72},${y0} ${x0 + MW * 0.42},${y0 + MH} ${x0},${y0 + MH}" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <line x1="${x0}" y1="${(y0 + MH * 0.46).toFixed(1)}" x2="${x0 + MW}" y2="${(y0 + MH * 0.46).toFixed(1)}" stroke="#ffffff" stroke-width="1.4" stroke-opacity="0.07" pointer-events="none"/>
    </g>`;
}

/** 
 * High-Fidelity 3D Molded Bakelite Bezel with Recessed Step Bevel,
 * Lower Seam Line, Mechanical Zero-Adjust Trimmer Screw, and Four Corner Slotted Screws.
 */
export function bezelRim(x0: number, y0: number, cx: number): string {
  const bx = x0 - 10;
  const by = y0 - 14;
  const bw = MW + 20;
  const bh = MH + 62;
  const seamY = y0 + MH + 10;
  const screwY = y0 + MH + 34;

  return `
    <!-- Outer 3D Molded Bezel Housing with Deep Drop Shadow -->
    <g class="xtm-bezel-3d" filter="url(#meterHousingShadow)">
      <!-- Outer Molded Black Rectangular Bezel -->
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.8" />
      <!-- Top Edge Rim Specular Highlight -->
      <line x1="${bx + 10}" y1="${by + 1.5}" x2="${bx + bw - 10}" y2="${by + 1.5}" stroke="#454952" stroke-width="1.2" stroke-linecap="round" />
      <!-- Outer Molded Flange Groove -->
      <rect x="${bx + 5}" y="${by + 6}" width="${bw - 10}" height="${bh - 12}" rx="7" fill="none" stroke="#25272c" stroke-width="1.0" />

      <!-- Recessed Inner Window Frame Step Bevel -->
      <rect x="${x0 - 3}" y="${y0 - 3}" width="${MW + 6}" height="${MH + 6}" rx="5" fill="url(#bezelInnerStepGrad)" stroke="#08090b" stroke-width="1.4" />

      <!-- Lower Molded Horizontal Seam Line -->
      <line x1="${bx + 2}" y1="${seamY}" x2="${bx + bw - 2}" y2="${seamY}" stroke="#0c0d0f" stroke-width="1.8" />
      <line x1="${bx + 2}" y1="${seamY + 1.5}" x2="${bx + bw - 2}" y2="${seamY + 1.5}" stroke="#2c2f36" stroke-width="1.0" />

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly -->
      <g class="trim-screw" transform="translate(${cx}, ${screwY})">
        <circle cx="0" cy="0" r="14" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.2" />
        <g transform="rotate(-30)">
          <circle cx="0" cy="0" r="11.5" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.0" />
          <rect x="-10" y="-1.6" width="20" height="3.2" rx="0.8" fill="#090a0c" />
          <line x1="-9.5" y1="1.8" x2="9.5" y2="1.8" stroke="#4e525b" stroke-width="0.7" />
        </g>
      </g>

      <!-- Four Corner Molded Bezel Slotted Screws -->
      <g transform="translate(${bx + 14}, ${by + 14})">
        <circle cx="0" cy="0" r="5.2" fill="#08090a" stroke="#1d1f23" stroke-width="0.8" />
        <circle cx="0" cy="0" r="3.8" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7" />
        <path d="M -2.4,-1.4 A 2.6,2.6 0 0 1 1.8,-2.0" fill="none" stroke="#727680" stroke-width="0.7" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="-1.9" y1="-1.5" x2="1.9" y2="1.5" stroke="#060708" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g transform="translate(${bx + bw - 14}, ${by + 14})">
        <circle cx="0" cy="0" r="5.2" fill="#08090a" stroke="#1d1f23" stroke-width="0.8" />
        <circle cx="0" cy="0" r="3.8" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7" />
        <path d="M -2.4,-1.4 A 2.6,2.6 0 0 1 1.8,-2.0" fill="none" stroke="#727680" stroke-width="0.7" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="-1.8" y1="1.6" x2="1.8" y2="-1.6" stroke="#060708" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g transform="translate(${bx + 14}, ${by + bh - 14})">
        <circle cx="0" cy="0" r="5.2" fill="#08090a" stroke="#1d1f23" stroke-width="0.8" />
        <circle cx="0" cy="0" r="3.8" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7" />
        <path d="M -2.4,-1.4 A 2.6,2.6 0 0 1 1.8,-2.0" fill="none" stroke="#727680" stroke-width="0.7" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="-2.2" y1="-1.0" x2="2.2" y2="1.0" stroke="#060708" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <g transform="translate(${bx + bw - 14}, ${by + bh - 14})">
        <circle cx="0" cy="0" r="5.2" fill="#08090a" stroke="#1d1f23" stroke-width="0.8" />
        <circle cx="0" cy="0" r="3.8" fill="url(#mcScrewGrad)" stroke="#111215" stroke-width="0.7" />
        <path d="M -2.4,-1.4 A 2.6,2.6 0 0 1 1.8,-2.0" fill="none" stroke="#727680" stroke-width="0.7" stroke-linecap="round" stroke-opacity="0.8" />
        <line x1="-1.5" y1="1.8" x2="1.5" y2="-1.8" stroke="#060708" stroke-width="1.4" stroke-linecap="round" />
      </g>
    </g>`;
}
