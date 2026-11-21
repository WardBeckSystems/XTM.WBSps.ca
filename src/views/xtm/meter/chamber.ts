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
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="65%" stop-color="#ffffff" stop-opacity="0.01"/>
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
      <rect x="${x0 + 6}" y="${(y0 + MH * 0.44).toFixed(1)}" width="${MW - 12}" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>
    </g>`;
}

/** 
 * Bezel assembly:
 * - Sleek modern hairline rim for Ward-Beck.com (.modern-bezel)
 * - 3D molded Bakelite bezel for McCurdyRadio.ca (.bezel-mc, full thickness)
 * - 3D molded Bakelite bezel for Ward-Beck.ca (.bezel-wbs, 1/2 thickness of McCurdy)
 * Outer frame cutout has fill-rule="evenodd" so the meter aperture is 100% open and dials remain visible.
 * Half-moon needle hub cowl removed per specification.
 */
export function bezelRim(x0: number, y0: number, cx: number = x0 + MW / 2): string {
  // 1. McCurdyRadio.ca: Full-Thickness Molded Bakelite Bezel
  const bx_mc = cx - 304; // 608 wide
  const by_mc = 47;
  const bw_mc = 608;
  const bh_mc = 360; // ends at y=407
  const br_mc = 14;

  const wx = cx - 274; // 548 wide, 30px side borders
  const wy = 65;
  const ww = 548;
  const wh = 212; // ends at y=277
  const wr = 7;
  const winBot = wy + wh; // 277

  const seamY_mc = 292;
  const screwY_mc = 344;

  const housingPathMc = `M ${bx_mc + br_mc} ${by_mc} h ${bw_mc - 2 * br_mc} a ${br_mc} ${br_mc} 0 0 1 ${br_mc} ${br_mc} v ${bh_mc - 2 * br_mc} a ${br_mc} ${br_mc} 0 0 1 -${br_mc} ${br_mc} h -${bw_mc - 2 * br_mc} a ${br_mc} ${br_mc} 0 0 1 -${br_mc} -${br_mc} v -${bh_mc - 2 * br_mc} a ${br_mc} ${br_mc} 0 0 1 ${br_mc} -${br_mc} Z M ${wx + wr} ${wy} h ${ww - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} ${wr} v ${wh - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} ${wr} h -${ww - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} -${wr} v -${wh - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} -${wr} Z`;

  // 2. Ward-Beck.ca: 1/2 Border & Skirt Thickness Bezel (Side border = 15px, Top border = 9px, Skirt = 65px)
  const bx_wbs = cx - 289; // 578 wide (leaves 15px side borders, 1/2 of 30px)
  const by_wbs = 56;       // 9px top border (1/2 of 18px)
  const bw_wbs = 578;
  const bh_wbs = 286;      // ends at y=342 (skirt height = 65px, 1/2 of 130px)
  const br_wbs = 8;

  const seamY_wbs = 285;
  const screwY_wbs = 314;

  const housingPathWbs = `M ${bx_wbs + br_wbs} ${by_wbs} h ${bw_wbs - 2 * br_wbs} a ${br_wbs} ${br_wbs} 0 0 1 ${br_wbs} ${br_wbs} v ${bh_wbs - 2 * br_wbs} a ${br_wbs} ${br_wbs} 0 0 1 -${br_wbs} ${br_wbs} h -${bw_wbs - 2 * br_wbs} a ${br_wbs} ${br_wbs} 0 0 1 -${br_wbs} -${br_wbs} v -${bh_wbs - 2 * br_wbs} a ${br_wbs} ${br_wbs} 0 0 1 ${br_wbs} -${br_wbs} Z M ${wx + wr} ${wy} h ${ww - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} ${wr} v ${wh - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} ${wr} h -${ww - 2 * wr} a ${wr} ${wr} 0 0 1 -${wr} -${wr} v -${wh - 2 * wr} a ${wr} ${wr} 0 0 1 ${wr} -${wr} Z`;

  return `
    <!-- Modern Sleek Bezel (Ward-Beck.com / McCurdyRadio.com) -->
    <g class="modern-bezel">
      <path d="M${x0 - 4} ${y0 + MH - 24} L${x0 - 4} ${y0 + MH - 18} A24 24 0 0 0 ${x0 + 18} ${y0 + MH + 4} L${x0 + MW - 18} ${y0 + MH + 4} A24 24 0 0 0 ${x0 + MW + 4} ${y0 + MH - 18} L${x0 + MW + 4} ${y0 + MH - 24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
      <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
      <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>
    </g>

    <!-- McCurdyRadio.ca Vintage 3D Molded Bakelite Bezel Housing (Full Thickness) -->
    <g class="vintage-bezel-3d bezel-mc">
      <!-- Molded Housing Body -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.8" d="${housingPathMc}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${bx_mc + 16} ${by_mc + 2} L ${bx_mc + bw_mc - 16} ${by_mc + 2}" stroke="#484d56" stroke-width="1.4" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${bx_mc + 6}" y="${by_mc + 6}" width="${bw_mc - 12}" height="${bh_mc - 12}" rx="${br_mc - 3}" fill="none" stroke="#25272c" stroke-width="1.0" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${wx - 2}" y="${wy - 2}" width="${ww + 4}" height="${wh + 4}" rx="${wr + 2}" fill="none" stroke="#08090b" stroke-width="2.5" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${wr}" fill="none" stroke="#2b2e34" stroke-width="1.4" stroke-opacity="0.85" pointer-events="none"/>

      <!-- Window Inner Shadows & Specular Glass Reflection Sheen -->
      <rect x="${wx}" y="${wy}" width="${ww}" height="22" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${wx}" y="${winBot - 18}" width="${ww}" height="18" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="16" height="${wh}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${wx + ww - 16}" y="${wy}" width="16" height="${wh}" fill="url(#xch_right)" pointer-events="none"/>
      <path d="M ${wx + 6} ${wy + 6} L ${wx + ww * 0.65} ${wy + 6} L ${wx + 6} ${winBot - 12} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${wx + 6}" y="${(wy + wh * 0.42).toFixed(1)}" width="${ww - 12}" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${bx_mc + 2}" y1="${seamY_mc}" x2="${bx_mc + bw_mc - 2}" y2="${seamY_mc}" stroke="#0c0d0f" stroke-width="2.0" pointer-events="none"/>
      <line x1="${bx_mc + 2}" y1="${seamY_mc + 1.8}" x2="${bx_mc + bw_mc - 2}" y2="${seamY_mc + 1.8}" stroke="#2c2f36" stroke-width="1.1" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt -->
      <g class="trim-screw-interactive" transform="translate(${cx}, ${screwY_mc})">
        <circle cx="0" cy="0" r="18" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.3"/>
        <circle cx="0" cy="0" r="16.5" fill="none" stroke="#08090a" stroke-width="0.9"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="14.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.1"/>
          <rect x="-12.5" y="-2.0" width="25" height="4.0" rx="0.9" fill="#090a0c"/>
          <line x1="-11.8" y1="2.1" x2="11.8" y2="2.1" stroke="#4e525b" stroke-width="0.8"/>
        </g>
      </g>
    </g>

    <!-- Ward-Beck.ca Vintage 3D Molded Bakelite Bezel Housing (1/2 Thickness of McCurdy) -->
    <g class="vintage-bezel-3d bezel-wbs">
      <!-- Molded Housing Body -->
      <path fill-rule="evenodd" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="1.1" d="${housingPathWbs}"/>

      <!-- Top Edge Specular Highlight Line -->
      <path d="M ${bx_wbs + 10} ${by_wbs + 1.5} L ${bx_wbs + bw_wbs - 10} ${by_wbs + 1.5}" stroke="#484d56" stroke-width="1.0" stroke-linecap="round" pointer-events="none"/>

      <!-- Molded Flange Perimeter Groove -->
      <rect x="${bx_wbs + 4}" y="${by_wbs + 4}" width="${bw_wbs - 8}" height="${bh_wbs - 8}" rx="${br_wbs - 2}" fill="none" stroke="#25272c" stroke-width="0.8" pointer-events="none"/>

      <!-- Inner Stepped Recessed Window Frame Rim -->
      <rect x="${wx - 1.5}" y="${wy - 1.5}" width="${ww + 3}" height="${wh + 3}" rx="${wr + 1}" fill="none" stroke="#08090b" stroke-width="1.6" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${wr}" fill="none" stroke="#2b2e34" stroke-width="1.0" stroke-opacity="0.85" pointer-events="none"/>

      <!-- Window Inner Shadows & Specular Glass Reflection Sheen -->
      <rect x="${wx}" y="${wy}" width="${ww}" height="18" fill="url(#xch_top)" pointer-events="none"/>
      <rect x="${wx}" y="${winBot - 14}" width="${ww}" height="14" fill="url(#xch_bot)" pointer-events="none"/>
      <rect x="${wx}" y="${wy}" width="12" height="${wh}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${wx + ww - 12}" y="${wy}" width="12" height="${wh}" fill="url(#xch_right)" pointer-events="none"/>
      <path d="M ${wx + 6} ${wy + 6} L ${wx + ww * 0.65} ${wy + 6} L ${wx + 6} ${winBot - 12} Z" fill="url(#meterGlassSheenGrad)" pointer-events="none"/>
      <rect x="${wx + 6}" y="${(wy + wh * 0.42).toFixed(1)}" width="${ww - 12}" height="1.6" fill="#ffffff" opacity="0.03" pointer-events="none"/>

      <!-- Lower Skirt Molded Horizontal Seam Line -->
      <line x1="${bx_wbs + 2}" y1="${seamY_wbs}" x2="${bx_wbs + bw_wbs - 2}" y2="${seamY_wbs}" stroke="#0c0d0f" stroke-width="1.4" pointer-events="none"/>
      <line x1="${bx_wbs + 2}" y1="${seamY_wbs + 1.2}" x2="${bx_wbs + bw_wbs - 2}" y2="${seamY_wbs + 1.2}" stroke="#2c2f36" stroke-width="0.8" pointer-events="none"/>

      <!-- Mechanical Zero-Adjust Trimmer Screw Assembly in Center of Skirt -->
      <g class="trim-screw-interactive" transform="translate(${cx}, ${screwY_wbs})">
        <circle cx="0" cy="0" r="13" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.0"/>
        <circle cx="0" cy="0" r="11.8" fill="none" stroke="#08090a" stroke-width="0.7"/>
        <g transform="rotate(-38)">
          <circle cx="0" cy="0" r="10.2" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="0.9"/>
          <rect x="-8.5" y="-1.5" width="17" height="3.0" rx="0.6" fill="#090a0c"/>
          <line x1="-8.0" y1="1.6" x2="8.0" y2="1.6" stroke="#4e525b" stroke-width="0.6"/>
        </g>
      </g>
    </g>`;
}
