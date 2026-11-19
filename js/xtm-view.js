/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS XTM Pure Precision Visualizer & SVG Renderer
 * High-performance 60+ FPS architecture with GPU-accelerated needle transforms
 * and direct DOM element updates (zero full-DOM teardown on animation frames).
 * Meters:
 *   - Meter 0: Channel A VU (Warm Amber dial)
 *   - Meter 1: Channel A Black PPM (European Black dial with Luminous Yellow needle)
 *   - Meter 2: Channel B VU (Warm Amber dial)
 *   - Meter 3: Channel B Black PPM (European Black dial with Luminous Yellow needle)
 *   - Center Console: Green WBS highlight frame, VFD display, 8-LED Phase bar,
 *     and interactive buttons.
 */

// 5x7 Dot-Matrix Font Glyphs
const FONT_5X7 = {
  ' ': [0,0,0,0,0,0,0], '-': [0,0,0,31,0,0,0], '/': [0,1,2,4,8,16,0], '.': [0,0,0,0,0,12,12],
  ':': [0,12,12,0,12,12,0], '+': [0,4,4,31,4,4,0], '%': [24,25,2,4,8,19,3],
  '0': [14,17,19,21,25,17,14], '1': [4,12,4,4,4,4,14], '2': [14,17,1,2,4,8,31],
  '3': [31,2,4,2,1,17,14], '4': [2,6,10,18,31,2,2], '5': [31,16,30,1,1,17,14],
  '6': [6,8,16,30,17,17,14], '7': [31,1,2,4,8,8,8], '8': [14,17,17,14,17,17,14], '9': [14,17,17,15,1,2,12],
  A: [14,17,17,17,31,17,17], B: [30,17,17,30,17,17,30], C: [14,17,16,16,16,17,14], D: [28,18,17,17,17,18,28],
  E: [31,16,16,30,16,16,31], F: [31,16,16,30,16,16,16], G: [14,17,16,23,17,17,15], H: [17,17,17,31,17,17,17],
  I: [14,4,4,4,4,4,14], J: [7,2,2,2,2,18,12], K: [17,18,20,24,20,18,17], L: [16,16,16,16,16,16,31],
  M: [17,27,21,21,17,17,17], N: [17,17,25,21,19,17,17], O: [14,17,17,17,17,17,14], P: [30,17,17,30,16,16,16],
  Q: [14,17,17,17,21,18,13], R: [30,17,17,30,20,18,17], S: [15,16,16,14,1,1,30], T: [31,4,4,4,4,4,4],
  U: [17,17,17,17,17,17,14], V: [17,17,17,17,17,10,4], W: [17,17,17,21,21,21,10], X: [17,17,10,4,10,17,17],
  Y: [17,17,17,10,4,4,4], Z: [31,1,2,4,8,16,31],
  a: [0,0,14,1,15,17,15], b: [16,16,22,25,17,17,30], c: [0,0,14,16,16,17,14], d: [1,1,13,19,17,17,15],
  e: [0,0,14,17,31,16,14], f: [6,9,8,28,8,8,8], g: [0,15,17,17,15,1,14], h: [16,16,22,25,17,17,17],
  i: [4,0,12,4,4,4,14], k: [16,16,18,20,24,20,18], l: [12,4,4,4,4,4,14], m: [0,0,26,21,21,17,17],
  n: [0,0,22,25,17,17,17], o: [0,0,14,17,17,17,14], p: [0,0,30,17,30,16,16], r: [0,0,22,25,16,16,16],
  s: [0,0,14,16,14,1,30], t: [8,8,28,8,8,9,6], u: [0,0,17,17,17,19,13], v: [0,0,17,17,17,10,4],
  w: [0,0,17,17,21,21,10], x: [0,0,17,10,4,10,17], y: [0,0,17,17,15,1,14], z: [0,0,31,2,4,8,31]
};

// Authentic Ward-Beck Systems Trademark Vector Logo (Stadium Screen TV Mark with Stylized WBS)
var WBS_LOGO_PATH = window.WBS_LOGO_PATH = window.WBS_LOGO_PATH || 'M2.43 4.14 C2.43 8.26 2.43 13.33 2.43 17.45 C2.43 20.03 31.29 20.41 33.55 20.41 C37.4 20.41 36.81 20.41 40.67 20.41 C42.87 20.41 71.66 20.03 71.66 17.45 L71.66 4.14 C71.66 1.57 42.82 1.26 40.67 1.23 L33.55 1.23 C31.29 1.23 2.43 1.57 2.43 4.14 Z M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z M7.82 6.09 L13.37 16.43 L15.16 16.43 L9.61 6.09 L7.82 6.09 Z M17.85 6.09 L18.93 6.09 L18.59 6.09 L19.64 6.09 L15.16 16.43 L14.27 14.58 L17.87 6.03 L17.85 6.09 Z M18.74 6.09 L23.4 16.43 L25.19 16.43 L20.53 6.09 L18.74 6.09 Z M25.19 16.43 L30.56 6.09 L28.77 6.09 L24.29 14.58 L25.19 16.43 Z M32.53 6.09 L32.53 16.43 L34.32 16.43 L34.32 6.09 L32.53 6.09 Z M34.32 6.09 L46.14 6.09 L45.24 7.94 L34.32 7.94 L34.32 6.09 Z M45.24 7.94 L46.14 6.09 L47.57 7.01 L46.14 8.49 L45.24 7.94 Z M47.57 7.01 L47.93 7.94 L46.14 8.49 L47.57 7.01 Z M47.93 7.94 L46.14 8.49 L46.14 9.78 L47.93 10.34 L47.93 7.94 Z M47.93 10.34 L46.14 9.78 L45.78 10.34 L47.03 11.26 L47.93 10.34 Z M47.03 11.26 L45.78 12.18 L46.14 12.55 L47.93 12.18 L47.03 11.26 Z M47.93 12.18 L47.93 14.58 L46.14 14.03 L46.14 12.55 L47.93 12.18 Z M47.93 14.58 L47.57 15.51 L46.14 14.03 L47.93 14.58 Z M47.57 15.51 L46.14 16.43 L45.24 14.58 L46.14 14.03 L47.57 15.51 Z M46.14 16.43 L45.24 14.58 L34.32 14.58 L34.32 16.43 L46.14 16.43 Z M34.32 10.34 L34.32 12.18 L45.78 12.18 L45.78 10.34 L34.32 10.34 Z M45.78 10.34 L45.78 12.18 L47.03 11.26 L45.78 10.34 Z M66.19 7.94 L66.19 6.09 L51.69 6.09 L52.58 7.94 L66.19 7.94 Z M52.58 7.94 L51.69 6.09 L50.25 7.01 L51.69 8.49 L52.58 7.94 Z M51.69 8.49 L50.25 7.01 L49.9 7.94 L51.69 8.49 Z M49.9 7.94 L51.69 8.49 L51.69 9.78 L49.9 10.34 L49.9 7.94 Z M49.9 10.34 L51.69 9.78 L51.69 9.78 L50.25 11.26 L49.9 10.34 Z M51.69 9.78 L50.25 11.26 L51.69 12.18 L52.58 10.34 L51.69 9.78 Z M51.69 12.18 L52.58 10.34 L64.4 10.34 L63.5 12.18 L51.69 12.18 Z M63.5 12.18 L64.4 10.34 L65.83 11.26 L64.4 12.55 L63.5 12.18 Z M65.83 11.26 L64.4 12.55 L66.19 12.18 L65.83 11.26 Z M64.4 12.55 L66.19 12.18 L66.19 14.58 L64.4 14.03 L64.4 12.55 Z M66.19 14.58 L65.83 15.51 L64.4 14.03 L66.19 14.58 Z M65.83 15.51 L64.4 14.03 L63.5 14.58 L64.4 16.43 L65.83 15.51 Z M63.5 14.58 L64.4 16.43 L49.9 16.43 L49.9 14.58 L63.5 14.58 Z';

class XtmView {
  constructor(containerEl) {
    this.container = containerEl;
    this.isBuilt = false;

    // Button tracking
    this.heldButton = null;

    // Responsive Canvas Geometry
    this.VW = 3200;
    this.VH = 430;

    // Meter Dimensions (Authentic broadcast aspect ratio, smaller window mask)
    this.MW = 580;
    this.MH = 290;

    // Meter Center Coordinates & Pivots (Pivots concealed below bottom bezel mask)
    this.MX = [373, 1002, 2198, 2827];
    this.MYc = 210;
    this.py = 410; // Pivot point located 55px below bottom meter mask edge (y = 355)
    this.R = 265;

    // Center Console
    this.DISP = { x: 1380, y: 80, w: 440, h: 98 };
    this.BX = {
      MODE: 1385,
      SOURCE: 1499,
      DOWN: 1613,
      UP: 1727
    };
    this.BW = 94;
    this.BH = 135;
    this.BY = 224;

    // Signal presence tracking for 10-second loss of signal warning
    this.lastAudioTime = performance.now();
    this.hasSignalLost = false;
    this.lastSignalLostState = false;

    // DOM Element Caches for zero-allocation 60 FPS updates
    this.needleEls = [null, null, null, null];
    this.phaseLedEls = [];
    this.vfdEl = null;
    this.modeTitleEl = null;
    this.btnEls = {};

    // Change detection caches
    this.lastAngles = [-999, -999, -999, -999];
    this.lastPhaseLed = -999;
    this.lastDisplayText = '';
    this.lastModeTitle = '';
    this.lastHeldButton = null;

    // Callbacks
    this.onButtonPressed = null;
    this.onButtonReleased = null;
  }

  /* ---------------- Needle Angle Calculations ---------------- */
  vuFrac(db) {
    return Math.pow(10, (db - 3) / 20);
  }

  vuAngle(p, isSifam = false) {
    if (isSifam) {
      // Sifam: 100 degree wide sweep (-50 deg to +50 deg)
      return -50 + 100 * Math.max(-0.03, Math.min(1.08, p));
    }
    // Simpson: 90 degree sweep (-45 deg to +45 deg)
    return -45 + 90 * Math.max(-0.03, Math.min(1.08, p));
  }

  ppmFrac(db) {
    if (db === null || !isFinite(db)) return -0.12;
    return db >= -12 ? (db + 12) / 24 : -0.12 * (1 - Math.pow(10, (db + 12) / 20));
  }

  ppmAngle(q, isSifam = false) {
    if (isSifam) {
      // Sifam: 100 degree wide sweep (-50 deg to +50 deg)
      return -50 + 100 * Math.max(-0.13, Math.min(1.08, q));
    }
    // Simpson: 90 degree sweep (-45 deg to +45 deg)
    return -45 + 90 * Math.max(-0.13, Math.min(1.08, q));
  }

  /* ---------------- Dot Matrix SVG Generator ---------------- */
  renderDotMatrix(text, x, y, pitch, onColor, offColor) {
    let s = '';
    const r = pitch * 0.38;
    for (let ci = 0; ci < text.length; ci++) {
      const g = FONT_5X7[text[ci]] || FONT_5X7[' '];
      const cx = x + ci * pitch * 6.2;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          const on = (g[row] >> (4 - col)) & 1;
          s += `<circle cx="${(cx + col * pitch).toFixed(1)}" cy="${(y + row * pitch).toFixed(1)}" r="${r.toFixed(2)}" fill="${on ? onColor : offColor}"/>`;
        }
      }
    }
    return s;
  }

  /* ---------------- Static Meter Dial Movement Shell ---------------- */
  renderMeterShell(id, cx, cy, kind, isPowered, dialLamp, isBlackPpm = false, meterStyle = 'simpson') {
    const MW = this.MW, MH = this.MH;
    const x0 = cx - MW / 2, y0 = cy - MH / 2;
    const px = cx, py = this.py, R = this.R;
    const isSifam = (meterStyle === 'sifam');

    const P = (a, r) => {
      const t = a * Math.PI / 180;
      return [px + r * Math.sin(t), py - r * Math.cos(t)];
    };

    let fillGrad = '#171512';
    let ink = '#141008';

    if (kind === 'ppm' || isBlackPpm) {
      fillGrad = isPowered ? 'url(#xblackppm)' : '#0a0b0d';
      ink = isPowered ? '#f8fafc' : '#475569';
    } else if (isPowered) {
      if (dialLamp === 'white') fillGrad = 'url(#xwhite)';
      else if (dialLamp === 'parchment') fillGrad = 'url(#xparchment)';
      else fillGrad = 'url(#xamber)';
      ink = '#141008';
    } else {
      ink = '#0c0a06';
    }

    const arc = (a0, a1, r, w, col) => {
      const [x1, y1] = P(a0, r), [x2, y2] = P(a1, r);
      return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
    };

    let s = `<clipPath id="xmc${id}"><rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28"/></clipPath>
    <g clip-path="url(#xmc${id})">
      <!-- Base Dial Plate Background with Rich Radiance Gradient -->
      <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="${fillGrad}"/>`;

    // Warm Incandescent Filament Halo Glow behind VU scales
    if (kind === 'vu' && isPowered && dialLamp !== 'white') {
      s += `<ellipse cx="${cx}" cy="${y0 + 115}" rx="${(MW * 0.42).toFixed(1)}" ry="82" fill="url(#xincand_bloom)"/>`;
    }

    if (kind === 'vu') {
      // VU Scale Arcs: -20 to 0 VU black, 0 to +3 VU red
      s += arc(this.vuAngle(this.vuFrac(-20), isSifam), this.vuAngle(this.vuFrac(0), isSifam), R, 3.8, ink);
      s += arc(this.vuAngle(this.vuFrac(0), isSifam), this.vuAngle(this.vuFrac(3), isSifam), R + 4, 12, '#b91c1c');

      // VU Major Ticks
      [-20, -10, -7, -5, -3, -2, -1, 0, 1, 2, 3].forEach(d => {
        const a = this.vuAngle(this.vuFrac(d), isSifam);
        const [x1, y1] = P(a, R), [x2, y2] = P(a, R + 22), [tx, ty] = P(a, R + 46);
        const col = d > 0 ? '#b91c1c' : ink;
        s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="4"/>
              <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
      });

      // Percentage sub-scale: 20, 40, 60, 80, 100%
      [20, 40, 60, 80, 100].forEach(pc => {
        const a = this.vuAngle((pc / 100) * 0.708, isSifam);
        const [x1, y1] = P(a, R - 6), [tx, ty] = P(a, R - 32);
        s += `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.2" fill="${ink}"/>
              <text x="${tx.toFixed(1)}" y="${(ty + 6).toFixed(1)}" font-size="16" text-anchor="middle" fill="${ink}">${pc}</text>`;
      });

      s += `<text x="${(x0 + 56).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${ink}">VU</text>
            <text x="${(x0 + MW - 56).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="#b91c1c" text-anchor="end">VU</text>`;
    } else {
      // European Black PPM Scale: -12 to +12 dB
      // Requirement 41: "the PPM upper range should be Yellow no red"
      const warnCol = '#facc15'; // YELLOW, NO RED!
      s += arc(this.ppmAngle(0, isSifam), this.ppmAngle(1, isSifam), R, 4, ink);
      s += arc(this.ppmAngle(18 / 24, isSifam), this.ppmAngle(1, isSifam), R + 8, 16, warnCol);

      for (let d = -12; d <= 12; d += 2) {
        const a = this.ppmAngle((d + 12) / 24, isSifam);
        const [x1, y1] = P(a, R), [x2, y2] = P(a, R + (d % 4 ? 14 : 24));
        const tickCol = (d >= 6 && isBlackPpm) ? '#facc15' : ink; // Yellow!
        s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${tickCol}" stroke-width="4"/>`;
      }

      [-12, -8, -4, 0, 4, 8, 12].forEach(d => {
        const a = this.ppmAngle((d + 12) / 24, isSifam);
        const [tx, ty] = P(a, R + 48);
        const col = (d >= 8 && isBlackPpm) ? '#facc15' : ink; // Yellow!
        s += `<text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" font-size="26" font-weight="700" text-anchor="middle" fill="${col}">${d > 0 ? '+' + d : d}</text>`;
      });

      // Position PPM and dB with ample corner margin clearing scale numbers
      s += `<text x="${(x0 + 54).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="${isBlackPpm ? '#f8fafc' : ink}">PPM</text>
            <text x="${(x0 + MW - 56).toFixed(0)}" y="${y0 + 58}" font-size="26" font-weight="800" fill="#facc15" text-anchor="end">dB</text>`;
    }

    // Authentic Ward-Beck Systems Heritage Emblem (Historic Stadium Screen Mark)
    s += `<g transform="translate(${(cx - 44.5).toFixed(1)}, ${(cy + 42).toFixed(1)}) scale(1.2)">
            <path d="${WBS_LOGO_PATH}" fill="${ink}" fill-rule="evenodd"/>
          </g>`;

    // Hardware-Accelerated Dynamic 3D Needle Assembly (Rotated via GPU Transform)
    // Pivot point (px, py) is concealed below the bottom of the meter bezel mask (never visualized)
    const topY = py - (R + 34);
    const isPpm = (kind === 'ppm' || isBlackPpm);
    const restAng = isSifam ? (isPpm ? -50 : -50) : (isPpm ? -45 : -45);

    let needleBody = '';
    let shadowTopY = topY + 6;

    if (isPpm) {
      if (isSifam) {
        // Tapered yellow needle for PPM
        needleBody = `
          <polygon points="${px - 3.8},${py} ${px + 3.8},${py} ${px + 1.2},${topY} ${px - 1.2},${topY}" fill="#ffd600"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY + 2}" stroke="#fffbe6" stroke-width="1.3" stroke-linecap="round"/>
        `;
      } else {
        needleBody = `
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="rgba(255,214,0,0.22)" stroke-width="7.5" stroke-linecap="round"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY}" stroke="#ffd600" stroke-width="4.6" stroke-linecap="round"/>
          <line x1="${px}" y1="${py}" x2="${px}" y2="${topY + 2}" stroke="#fffbe6" stroke-width="1.4" stroke-linecap="round"/>
        `;
      }
    } else {
      // VU Meter Needle
      if (isSifam) {
        // Sifam: Tapered slender black knife needle
        needleBody = `
          <polygon points="${px - 3.8},${py} ${px + 3.8},${py} ${px + 0.9},${topY} ${px - 0.9},${topY}" fill="#0b0c0e"/>
          <line x1="${px - 0.5}" y1="${py}" x2="${px - 0.5}" y2="${topY + 4}" stroke="rgba(255,255,255,0.38)" stroke-width="1.2"/>
        `;
      } else {
        // Simpson VU: Red needle with classic spade pointer
        // The pointed sharp end of the spade IS the tip of the needle, ending at the main scale arc (R + 4).
        // Provides large 42px clearance between the needle tip and numbers.
        const tipY = py - (R + 4);
        shadowTopY = tipY + 2;
        needleBody = `
          <line x1="${px}" y1="${py}" x2="${px}" y2="${tipY + 20}" stroke="#dc2626" stroke-width="4.2" stroke-linecap="round"/>
          <polygon points="${px},${tipY} ${px + 5},${tipY + 11} ${px},${tipY + 22} ${px - 5},${tipY + 11}" fill="#dc2626"/>
          <polygon points="${px},${tipY + 2.5} ${px + 2.8},${tipY + 11} ${px},${tipY + 19} ${px - 2.8},${tipY + 11}" fill="#ef4444"/>
          <line x1="${px - 0.6}" y1="${py}" x2="${px - 0.6}" y2="${tipY + 21}" stroke="rgba(255,255,255,0.42)" stroke-width="1.2"/>
        `;
      }
    }

    s += `
      <g id="xtm_needle_${id}" transform="rotate(${restAng} ${px} ${py})">
        <!-- Needle 3D Drop Shadow on Recessed Dial Face -->
        <line x1="${px + 3.8}" y1="${py + 3.8}" x2="${px + 3.8}" y2="${shadowTopY}" stroke="rgba(0,0,0,0.42)" stroke-width="5" stroke-linecap="round"/>
        <!-- Physical Needle Body -->
        ${needleBody}
      </g>`;

    // Recessed Dial Chamber 3D Depth Shadows (Cast by overhanging bezel onto dial plate)
    s += `
      <!-- Top Chamber Overhang Shadow -->
      <rect x="${x0}" y="${y0}" width="${MW}" height="54" fill="url(#xch_top)" pointer-events="none"/>
      <!-- Bottom Bezel Ledge Shadow -->
      <rect x="${x0}" y="${y0 + MH - 42}" width="${MW}" height="42" fill="url(#xch_bot)" pointer-events="none"/>
      <!-- Left & Right Chamber Wall Vignettes -->
      <rect x="${x0}" y="${y0}" width="32" height="${MH}" fill="url(#xch_left)" pointer-events="none"/>
      <rect x="${x0 + MW - 32}" y="${y0}" width="32" height="${MH}" fill="url(#xch_right)" pointer-events="none"/>
      <!-- Recessed Dial Plate Inner Bevel Stroke -->
      <rect x="${x0 + 1}" y="${y0 + 1}" width="${MW - 2}" height="${MH - 2}" rx="27" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="2.5" pointer-events="none"/>
    </g>`;

    // Authentic Broadcast Molded Bezel Frame (Dark Bezel without individual green outline)
    s += `
    <!-- Bezel Bottom Dark Cast Shadow -->
    <path d="M${x0 - 4} ${y0 + MH - 24} L${x0 - 4} ${y0 + MH - 18} A24 24 0 0 0 ${x0 + 18} ${y0 + MH + 4} L${x0 + MW - 18} ${y0 + MH + 4} A24 24 0 0 0 ${x0 + MW + 4} ${y0 + MH - 18} L${x0 + MW + 4} ${y0 + MH - 24}" stroke="rgba(0,0,0,0.85)" stroke-width="3" fill="none"/>
    <!-- Molded Bezel Dark Stepped Rim -->
    <rect x="${x0 - 2}" y="${y0 - 2}" width="${MW + 4}" height="${MH + 4}" rx="29" fill="none" stroke="#14181f" stroke-width="3"/>
    <rect x="${x0}" y="${y0}" width="${MW}" height="${MH}" rx="28" fill="none" stroke="#0a0c0f" stroke-width="2.5"/>`;

    return s;
  }

  /* ---------------- Build Complete Base SVG Shell ---------------- */
  buildShell(model) {
    const on = model.power;

    let s = `<svg viewBox="0 0 ${this.VW} ${this.VH}" role="img" aria-label="Ward-Beck Systems XTM Master Visualizer" style="width:100%;display:block;border-radius:0">
      <defs>
        <!-- Rich Incandescent Warm Golden Amber Glow -->
        <radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>

        <!-- Incandescent Arc Bloom Illuminator -->
        <radialGradient id="xincand_bloom" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#fed766" stop-opacity="0.32"/>
          <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>

        <!-- Classic European Broadcast Black PPM -->
        <radialGradient id="xblackppm" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>

        <!-- Crisp Studio Daylight White -->
        <radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>

        <!-- Vintage Simpson Aged Parchment -->
        <radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>

        <!-- Chamber Recess Shadows (Overhang, Ledge, Walls) -->
        <linearGradient id="xch_top" x1="0" y1="0" x2="0" y2="1">
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

        <!-- Protective Glass Sheen Glare -->
        <linearGradient id="xglass_sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>

        <!-- Authentic Machined Brushed Silver / Metallic Aluminum Trim Rings -->
        <linearGradient id="xsilver_ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="18%" stop-color="#e2e8f0"/>
          <stop offset="38%" stop-color="#94a3b8"/>
          <stop offset="55%" stop-color="#f8fafc"/>
          <stop offset="72%" stop-color="#64748b"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>

        <linearGradient id="xsilver_bevel" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="30%" stop-color="#cbd5e1"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#64748b"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>

        <!-- Center Console Signature Broadcast Green Plate (Requirement: Solid Broadcast Green Faceplate) -->
        <linearGradient id="xgreen_panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="25%" stop-color="#16a34a"/>
          <stop offset="75%" stop-color="#15803d"/>
          <stop offset="100%" stop-color="#166534"/>
        </linearGradient>

        <filter id="xglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="xledglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Seamless Borderless Canvas -->
      <rect width="${this.VW}" height="${this.VH}" fill="#0f1114"/>

      <!-- Channel A Signature Green Console Frame (Authentic Silkscreen Frame with Center Bottom Gap, No Text) -->
      <path d="M 640 414 H 49 A 14 14 0 0 1 35 400 V 30 A 14 14 0 0 1 49 16 H 1326 A 14 14 0 0 1 1340 30 V 400 A 14 14 0 0 1 1326 414 H 735"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85"/>

      <!-- Channel A Pair: Meter 0 (VU Amber) + Meter 1 (Classic European Black PPM with Yellow Needle) -->
      ${this.renderMeterShell(0, this.MX[0], this.MYc, 'vu', on, model.dialLamp, false, model.meterStyle)}
      ${this.renderMeterShell(1, this.MX[1], this.MYc, 'ppm', on, model.dialLamp, true, model.meterStyle)}

      <!-- Center Console Section -->
      <g>
        <!-- 8-Segment Phase Correlation Bar (Requirement 7: 2X Size dots, font fine) -->
        <text x="1395" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">0°</text>
        ${(() => {
          let ps = '';
          for (let i = 0; i < 8; i++) {
            const cx = 1438 + i * 46;
            const cy = 42;
            ps += `
              <circle cx="${cx}" cy="${cy}" r="22" fill="#08090a" stroke="#25282f" stroke-width="2"/>
              <rect id="xphase_led_${i}" x="${(cx-12).toFixed(1)}" y="${(cy-8).toFixed(1)}" width="24" height="16" fill="#142e17"/>`;
          }
          return ps;
        })()}
        <text x="1805" y="48" font-size="16" font-weight="700" fill="#718096" text-anchor="middle">180°</text>

        <!-- Center Console Signature Solid Green Plate (Solid green, no border) -->
        <rect x="1355" y="70" width="490" height="344" rx="12" fill="#15803d"/>

        <!-- Center VFD Dot-Matrix Display Cutout Window -->
        <rect x="${this.DISP.x}" y="${this.DISP.y}" width="${this.DISP.w}" height="${this.DISP.h}" rx="6" fill="#040605" stroke="#052e16" stroke-width="2.5"/>
        <g id="xvfd_group" ${on ? 'filter="url(#xglow)"' : ''}></g>

        <!-- Mode & Source Front-Panel Buttons (Rectangular pushbutton switches with white labels above) -->
        ${Object.keys(this.BX).map(b => {
          const x = this.BX[b];
          const y = this.BY;
          const bh = this.BH;
          const topH = Math.round(bh * 0.44);
          const botH = bh - topH - 5;
          return `
          <g class="xtm-btn" id="xtm_btn_${b}" data-btn="${b}" style="cursor:pointer">
            <!-- Label placed ABOVE the button in crisp WHITE -->
            <text id="xtm_btn_lbl_${b}" x="${x + this.BW / 2}" y="206" font-size="14" font-weight="900" text-anchor="middle"
                  fill="#ffffff" letter-spacing="1.5">${b}</text>
            <!-- Rectangular outer border -->
            <rect id="xtm_btn_border_${b}" x="${x}" y="${y}" width="${this.BW}" height="${bh}" rx="2"
                  fill="#0b0d10" stroke="#1f2937" stroke-width="2"/>
            <!-- Top half rectangular switch cap -->
            <rect id="xtm_btn_top_${b}" x="${x + 3}" y="${y + 3}" width="${this.BW - 6}" height="${topH}" rx="1"
                  fill="#2d3748" stroke="#374151" stroke-width="1"/>
            <rect id="xtm_btn_sheen_${b}" x="${x + 6}" y="${y + 5}" width="${this.BW - 12}" height="14" rx="1"
                  fill="rgba(255,255,255,0.08)"/>
            <!-- Bottom half rectangular molded body -->
            <rect id="xtm_btn_bot_${b}" x="${x + 3}" y="${y + topH + 3}" width="${this.BW - 6}" height="${botH}" rx="1"
                  fill="#11151c" stroke="#1a202c" stroke-width="1"/>
          </g>`;
        }).join('')}
      </g>

      <!-- Channel B Signature Green Console Frame (Authentic Silkscreen Frame with Center Bottom Gap, No Text) -->
      <path d="M 2465 414 H 1874 A 14 14 0 0 1 1860 400 V 30 A 14 14 0 0 1 1874 16 H 3151 A 14 14 0 0 1 3165 30 V 400 A 14 14 0 0 1 3151 414 H 2560"
            fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.85"/>

      <!-- Channel B Pair: Meter 2 (VU Amber) + Meter 3 (Classic European Black PPM with Yellow Needle) -->
      ${this.renderMeterShell(2, this.MX[2], this.MYc, 'vu', on, model.dialLamp, false, model.meterStyle)}
      ${this.renderMeterShell(3, this.MX[3], this.MYc, 'ppm', on, model.dialLamp, true, model.meterStyle)}
    </svg>`;

    return s;
  }

  /* ---------------- Fast Direct DOM Binding ---------------- */
  initDom() {
    for (let i = 0; i < 4; i++) {
      this.needleEls[i] = this.container.querySelector(`#xtm_needle_${i}`);
    }
    for (let i = 0; i < 8; i++) {
      this.phaseLedEls[i] = this.container.querySelector(`#xphase_led_${i}`);
    }
    this.vfdEl = this.container.querySelector('#xvfd_group');
    this.modeTitleEl = this.container.querySelector('#xtm_mode_title');

    Object.keys(this.BX).forEach(b => {
      this.btnEls[b] = {
        border: this.container.querySelector(`#xtm_btn_border_${b}`),
        top: this.container.querySelector(`#xtm_btn_top_${b}`),
        bot: this.container.querySelector(`#xtm_btn_bot_${b}`),
        sheen: this.container.querySelector(`#xtm_btn_sheen_${b}`),
        lbl: this.container.querySelector(`#xtm_btn_lbl_${b}`)
      };
    });

    this.attachEvents();
  }

  /* ---------------- Event Delegation Attached Once ---------------- */
  attachEvents() {
    if (this._eventsAttached || !this.container) return;
    this._eventsAttached = true;

    this.container.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.xtm-btn');
      if (btn) {
        e.preventDefault();
        const name = btn.getAttribute('data-btn');
        this.heldButton = name;
        if (this.onButtonPressed) this.onButtonPressed(name);
        return;
      }
    });

    const handleRelease = () => {
      if (this.heldButton) {
        const name = this.heldButton;
        this.heldButton = null;
        if (this.onButtonReleased) this.onButtonReleased(name);
      }
    };

    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);
  }

  /* =========================================================================
     PRIORITY 1: Ultra-Low Latency Needle Processing & GPU Transforms
     Called FIRST before ANY secondary display or UI elements are processed.
     ========================================================================= */
  updateNeedles(levels, on = true) {
    if (!this.container) return;

    if (!this.isBuilt) {
      this.container.innerHTML = this.buildShell(window.xtmModel);
      this.initDom();
      this.isBuilt = true;
    }

    const py = this.py;
    const vu = (levels && levels.vu) ? levels.vu : [0, 0];
    const ppm = (levels && levels.ppm) ? levels.ppm : [-0.12, -0.12];

    const isSifam = window.xtmModel ? (window.xtmModel.meterStyle === 'sifam') : false;
    const restVu = isSifam ? -50 : -45;
    const restPpm = isSifam ? -50 : -45;

    const m0Ang = on ? this.vuAngle(vu[0], isSifam) : restVu;
    const m1Ang = on ? this.ppmAngle(ppm[0], isSifam) : restPpm;
    const m2Ang = on ? this.vuAngle(vu[1], isSifam) : restVu;
    const m3Ang = on ? this.ppmAngle(ppm[1], isSifam) : restPpm;

    const angles = [m0Ang, m1Ang, m2Ang, m3Ang];
    for (let i = 0; i < 4; i++) {
      // Direct GPU matrix update: threshold lowered to 0.005 for high-fidelity micro-movements
      if (Math.abs(angles[i] - this.lastAngles[i]) > 0.005) {
        this.lastAngles[i] = angles[i];
        const el = this.needleEls[i];
        if (el) {
          el.setAttribute('transform', `rotate(${angles[i].toFixed(2)} ${this.MX[i]} ${py})`);
        }
      }
    }
  }

  /* =========================================================================
     PRIORITY 2: Secondary Visual Elements (LEDs, VFD Display, Button States)
     Processed strictly AFTER needle positions are committed.
     ========================================================================= */
  renderSecondary(model, levels) {
    if (!this.container || !this.isBuilt) return;

    const on = model ? model.power : true;

    // 2. Phase Correlation LEDs (Update only when active LED changes)
    const led = on ? levels.phaseLed : -1;
    if (led !== this.lastPhaseLed) {
      this.lastPhaseLed = led;
      for (let i = 0; i < 8; i++) {
        const el = this.phaseLedEls[i];
        if (!el) continue;
        const isLit = on && i === led;
        const litColor = i <= 1 ? '#ff4d36' : (i <= 3 ? '#ffb43a' : '#9dff3a');
        const offColor = i <= 1 ? '#3a1810' : (i <= 3 ? '#3a2810' : '#142e17');
        el.setAttribute('fill', isLit ? litColor : offColor);
        if (isLit) el.setAttribute('filter', 'url(#xledglow)');
        else el.removeAttribute('filter');
      }
    }

    // 3. Signal Presence Tracking & 10s Loss of Signal Warning
    const now = performance.now();
    const hasSignal = levels && (
      levels.hasAudio ||
      (levels.ppmDb && (levels.ppmDb[0] > -55 || levels.ppmDb[1] > -55)) ||
      (levels.dbfs && (levels.dbfs[0] > -58 || levels.dbfs[1] > -58)) ||
      (levels.vuDb && (levels.vuDb[0] > -55 || levels.vuDb[1] > -55))
    );

    if (hasSignal) {
      this.lastAudioTime = now;
      this.hasSignalLost = false;
    } else if (now - this.lastAudioTime >= 10000) {
      this.hasSignalLost = true;
    }

    // VFD Dot-Matrix Display: Alternating telemetry or 10s Loss of Signal warning
    let txt = '';
    let vfdColor = '#c8f53c';
    let vfdOffColor = 'rgba(150,200,60,.06)';

    if (!on) {
      txt = '        ';
    } else if (model && model.flashMsg) {
      txt = model.flashMsg.padEnd(8).substring(0, 8);
    } else if (model && model.mode === 'SET') {
      txt = model.getDisplayText();
    } else if (this.hasSignalLost) {
      // Broadcast standard: Warning when silence exceeds 10 seconds
      // Alternates every 800ms between "LOSS OF " and " SIGNAL " in warning amber
      const warnPhase = Math.floor((now % 1600) / 800);
      txt = warnPhase === 0 ? 'LOSS OF ' : ' SIGNAL ';
      vfdColor = '#fbbf24';
      vfdOffColor = 'rgba(251,191,36,.08)';
    } else {
      // 6-second cycle: 4/6 Integ LUFS (4s), 1/6 WardBeck (1s), 1/6 Systems (1s)
      const cycleMs = 6000;
      const phaseMs = now % cycleMs;

      if (phaseMs < 4000) {
        // 4/6 of the time: Loudness value based on model.vfdMetric
        const metric = (model && model.vfdMetric) ? model.vfdMetric : 'lufs';
        let val = -60;
        let suffix = 'LU';

        if (metric === 'lus') {
          val = (levels && levels.lufs && typeof levels.lufs.s === 'number') ? levels.lufs.s : -60;
          suffix = 'S ';
        } else if (metric === 'lum') {
          val = (levels && levels.lufs && typeof levels.lufs.m === 'number') ? levels.lufs.m : -60;
          suffix = 'M ';
        } else if (metric === 'lui') {
          val = (levels && levels.lufs && typeof levels.lufs.i === 'number') ? levels.lufs.i : -60;
          suffix = 'I ';
        } else if (metric === 'lra') {
          val = (levels && levels.lufs && typeof levels.lufs.lra === 'number') ? levels.lufs.lra : 0;
          suffix = 'RA';
        } else {
          val = (levels && levels.lufs && typeof levels.lufs.i === 'number') ? levels.lufs.i : -60;
          suffix = 'LU';
        }

        if (metric === 'lra') {
          txt = (val.toFixed(1) + ' ' + suffix).padStart(8).substring(0, 8);
        } else if (isFinite(val) && val > -59.5) {
          const numStr = val.toFixed(1);
          txt = (numStr + ' ' + suffix).length <= 8 ? (numStr + ' ' + suffix).padStart(8) : (numStr + suffix);
        } else {
          txt = '-INF ' + suffix;
        }
      } else if (phaseMs < 5000) {
        // 1/6 of the time: WardBeck
        txt = 'WardBeck';
      } else {
        // 1/6 of the time: Systems (Requirement 4)
        txt = 'Systems ';
      }
    }

    if ((txt !== this.lastDisplayText || this.hasSignalLost !== this.lastSignalLostState) && this.vfdEl) {
      this.lastDisplayText = txt;
      this.lastSignalLostState = this.hasSignalLost;
      const p = 8.2;
      const w8 = (8 * 6.2 - 1.2) * p;
      const dx = this.DISP.x + (this.DISP.w - w8) / 2;
      const dy = this.DISP.y + (this.DISP.h - 6 * p) / 2;
      this.vfdEl.innerHTML = this.renderDotMatrix(txt, dx, dy, p, vfdColor, vfdOffColor);
    }

    // 4. Status Title (Update only when routing changes or signal lost)
    let modeTitle = 'SOUNDCARD INPUT';
    if (this.hasSignalLost) {
      modeTitle = '⚠ LOSS OF SIGNAL (NO AUDIO DETECTED)';
    } else if (model) {
      if (model.mode === 'D') modeTitle = 'COMPUTER AUDIO OUTPUT';
      else if (model.mode === 'S') modeTitle = 'TEST OSCILLATOR';
      else if (model.mode === 'SET') modeTitle = 'SETUP & CALIBRATION';
    }

    if (modeTitle !== this.lastModeTitle && this.modeTitleEl) {
      this.lastModeTitle = modeTitle;
      this.modeTitleEl.textContent = modeTitle;
    }

    // 5. Button Press Visual Feedback (Requirement 19b: White text above rectangular buttons)
    if (this.heldButton !== this.lastHeldButton) {
      this.lastHeldButton = this.heldButton;
      Object.keys(this.BX).forEach(b => {
        const els = this.btnEls[b];
        if (!els || !els.top) return;
        const isDown = this.heldButton === b;
        if (isDown) {
          els.top.setAttribute('fill', '#15803d');
          els.top.setAttribute('stroke', '#86efac');
          if (els.bot) els.bot.setAttribute('fill', '#0e2e18');
          if (els.border) els.border.setAttribute('stroke', '#86efac');
          if (els.lbl) els.lbl.setAttribute('fill', '#ffffff');
        } else {
          els.top.setAttribute('fill', '#2d3748');
          els.top.setAttribute('stroke', '#374151');
          if (els.bot) els.bot.setAttribute('fill', '#11151c');
          if (els.border) els.border.setAttribute('stroke', '#1f2937');
          if (els.lbl) els.lbl.setAttribute('fill', '#ffffff');
        }
      });
    }
  }

  /* ---------------- Unified 60 FPS Direct Update Engine ---------------- */
  render(model, levels) {
    if (!this.container) return;

    if (!this.isBuilt) {
      this.container.innerHTML = this.buildShell(model);
      this.initDom();
      this.isBuilt = true;
    }

    // 1. NEEDLES PROCESSED FIRST
    this.updateNeedles(levels, model ? model.power : true);

    // 2. SECONDARY PROCESSING AFTER
    this.renderSecondary(model, levels);
  }
}

window.XtmView = XtmView;
