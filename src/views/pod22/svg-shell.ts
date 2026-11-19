/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * POD-22 static SVG shell: bezel slots, LED bodies, diffuser cores, centre
 * scale numerals and range legends. Built once per range change.
 */

import { EXT_RANGE_HEADERS, STD_RANGE_HEADERS } from './range-headers';

/** The view state the shell builder reads. */
export interface Pod22ShellSource {
  readonly PW: number;
  readonly PH: number;
  readonly minP: number;
  readonly maxP: number;
  readonly SCALE: readonly string[];
  readonly extendedLed22: boolean;
  segX(p: number): number;
  scaleNumColor(p: number, lb?: string): string;
}

/* ---------------- Build Static Base SVG Shell Once ---------------- */
export function buildPod22Shell(v: Pod22ShellSource): string {
    const L = (x: number, y: number, w: number, h: number, row: number, p: number, title?: string): string => {
      const x0 = (x - w / 2).toFixed(1);
      const y0 = (y - h / 2).toFixed(1);
      return `
        <g id="pod_slot_${row}_${p}">
          <!-- Smoked Bezel Slot -->
          <rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="3" fill="#06080a" stroke="#171b22" stroke-width="1.2"/>
          <!-- Dimmer Smoky Diffuse LED Body -->
          <rect id="pod_led_${row}_${p}" x="${(parseFloat(x0) + 1.5).toFixed(1)}" y="${(parseFloat(y0) + 1.5).toFixed(1)}"
                width="${w - 3}" height="${h - 3}" rx="2" fill="#111317" opacity="0.16"/>
          <!-- Internal Smoky Diffuser Core Reflection -->
          <rect id="pod_core_${row}_${p}" x="${(x - 2).toFixed(1)}" y="${(parseFloat(y0) + 5).toFixed(1)}"
                width="4" height="${h - 10}" rx="2" fill="#ffffff" opacity="0"/>
          ${title ? `<title>${title}</title>` : ''}
        </g>`;
    };

    let s = `<svg viewBox="0 0 ${v.PW} ${v.PH}" role="img" aria-label="Ward-Beck Systems POD-22 Loudness Bar" style="width:100%;display:block;border-radius:0">
      <defs>
        <!-- Soft Smoky Diffuse LED Bloom Filter -->
        <filter id="smokyglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Recessed Chamber Overhang Shadows -->
        <linearGradient id="p22_top_shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="p22_bot_shadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
        </linearGradient>
      </defs>

      <!-- Seamless Dark Borderless Console Surface -->
      <rect class="p22-bg" width="${v.PW}" height="${v.PH}" fill="#08090b"/>

      <!-- ================= Borderless Meter Sections ================= -->
      <g id="pod_sections">
        <!-- Vertical Bargraphs (32w x 54h, tight 46px pitch) -->
        <!-- Row 0: Left Channel -->
        ${(() => {
          let rs = '';
          for (let p = v.minP; p <= v.maxP; p++) {
            const idx = p - v.minP;
            const label = v.SCALE[idx] ?? '';
            rs += L(v.segX(p), 38, 32, 54, 0, p, `Left ${label}`);
          }
          return rs;
        })()}

        <!-- Center Numerical Scale Markings -->
        ${v.SCALE.map((lb, idx) => {
          const p = v.minP + idx;
          const x = v.segX(p);
          const isZero = p === 25;
          const isOne = p === 24 || p === 26; // -1 and +1
          const isPk = p === v.maxP;
          const col = v.scaleNumColor(p, lb);
          return `
            ${isZero ? `<polygon points="${x - 4.5},68 ${x + 4.5},68 ${x},76" fill="#ef4444"/>
                        <polygon points="${x - 4.5},106 ${x + 4.5},106 ${x},98" fill="#ef4444"/>` : ''}
            <text x="${x}" y="87" dominant-baseline="central" font-size="${isZero || isPk ? 13 : (isOne ? 12 : 11)}" font-weight="${isZero || isPk || isOne || p >= 40 ? '900' : '700'}"
                  fill="${col}" text-anchor="middle" font-family="ui-monospace, monospace">${lb}</text>`;
        }).join('')}

        <!-- Row 1: Right Channel -->
        ${(() => {
          let rs = '';
          for (let p = v.minP; p <= v.maxP; p++) {
            const idx = p - v.minP;
            const label = v.SCALE[idx] ?? '';
            rs += L(v.segX(p), 136, 32, 54, 1, p, `Right ${label}`);
          }
          return rs;
        })()}

        <!-- Range Headers Below Meter Segments (Nothing On Top) -->
        ${v.extendedLed22 ? EXT_RANGE_HEADERS : STD_RANGE_HEADERS}
      </g>
    </svg>`;

    return s;
}
