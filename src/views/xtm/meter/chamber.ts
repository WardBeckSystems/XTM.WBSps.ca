/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Meter chamber: recess shadow gradients, recess shadow overlay and 3D molded bezel rim. */
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

/** 3D Molded Bakelite Bezel Housing with Stepped Inner Well, Seam Line, and Mechanical Trimmer Screw */
export function bezelRim(x0: number, y0: number, cx: number = x0 + MW / 2): string {
  const bx = x0 - 16;
  const by = y0 - 18;
  const bw = MW + 32; // 612
  const bh = MH + 86; // 376 (e.g. 47 to 423)
  const seamY = y0 + MH + 12; // 367
  const screwY = y0 + MH + 46; // 401

  return `
    <!-- Outer Molded Bakelite Bezel with Specular Top Highlight -->
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="url(#bezelMoldedGrad)" stroke="#090a0c" stroke-width="2.2"/>
    <path d="M ${bx + 14} ${by + 2} L ${bx + bw - 14} ${by + 2}" stroke="#484d56" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="${bx + 5}" y="${by + 5}" width="${bw - 10}" height="${bh - 10}" rx="8" fill="none" stroke="#25272c" stroke-width="1.1"/>

    <!-- Inner Stepped Recessed Window Opening -->
    <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="6" fill="url(#bezelInnerStepGrad)" stroke="#08090b" stroke-width="1.8"/>
    <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="4" fill="none" stroke="#0a0c0f" stroke-width="1.5"/>

    <!-- Lower Bezel Horizontal Seam -->
    <line x1="${bx + 2}" y1="${seamY}" x2="${bx + bw - 2}" y2="${seamY}" stroke="#0c0d0f" stroke-width="2"/>
    <line x1="${bx + 2}" y1="${seamY + 1.8}" x2="${bx + bw - 2}" y2="${seamY + 1.8}" stroke="#2c2f36" stroke-width="1.1"/>

    <!-- Mechanical Zero-Adjust Trimmer Screw at Bottom Center -->
    <g class="trim-screw-interactive" transform="translate(${cx}, ${screwY})">
      <circle cx="0" cy="0" r="17" fill="#0d0e10" stroke="#2c2f36" stroke-width="1.4"/>
      <circle cx="0" cy="0" r="13.5" fill="url(#trimScrewHeadGrad)" stroke="#111214" stroke-width="1.1"/>
      <g transform="rotate(-38)">
        <rect x="-11" y="-2" width="22" height="4" rx="0.9" fill="#090a0c"/>
        <line x1="-10.5" y1="2.2" x2="10.5" y2="2.2" stroke="#4e525b" stroke-width="0.8"/>
      </g>
    </g>`;
}
