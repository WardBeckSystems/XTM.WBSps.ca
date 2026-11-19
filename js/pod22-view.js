/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * WBS POD-22 Stereo Loudness Meter - Pure Borderless View & SVG Renderer
 * High-performance 60+ FPS direct DOM update engine with smoked acrylic diffuser lens.
 * Zero DOM teardown per frame.
 */

// Authentic Ward-Beck Systems Trademark Vector Logo (Stadium Screen TV Mark with Stylized WBS)
var WBS_LOGO_PATH = window.WBS_LOGO_PATH || 'M2.43 4.14 C2.43 8.26 2.43 13.33 2.43 17.45 C2.43 20.03 31.29 20.41 33.55 20.41 C37.4 20.41 36.81 20.41 40.67 20.41 C42.87 20.41 71.66 20.03 71.66 17.45 L71.66 4.14 C71.66 1.57 42.82 1.26 40.67 1.23 L33.55 1.23 C31.29 1.23 2.43 1.57 2.43 4.14 Z M-0.03 3.81 C-0.03 7.93 -0.03 13.59 -0.03 17.71 C-0.03 21.6 31.29 21.6 33.55 21.6 C35.9 21.6 38.28 21.6 40.67 21.6 C42.87 21.6 74.06 21.6 74.06 17.71 L74.06 3.81 C74.06 -0 42.87 -0 40.67 -0 C36.81 -0 37.4 -0 33.55 -0 C31.29 -0 -0.03 -0 -0.03 3.81 Z M7.82 6.09 L13.37 16.43 L15.16 16.43 L9.61 6.09 L7.82 6.09 Z M17.85 6.09 L18.93 6.09 L18.59 6.09 L19.64 6.09 L15.16 16.43 L14.27 14.58 L17.87 6.03 L17.85 6.09 Z M18.74 6.09 L23.4 16.43 L25.19 16.43 L20.53 6.09 L18.74 6.09 Z M25.19 16.43 L30.56 6.09 L28.77 6.09 L24.29 14.58 L25.19 16.43 Z M32.53 6.09 L32.53 16.43 L34.32 16.43 L34.32 6.09 L32.53 6.09 Z M34.32 6.09 L46.14 6.09 L45.24 7.94 L34.32 7.94 L34.32 6.09 Z M45.24 7.94 L46.14 6.09 L47.57 7.01 L46.14 8.49 L45.24 7.94 Z M47.57 7.01 L47.93 7.94 L46.14 8.49 L47.57 7.01 Z M47.93 7.94 L46.14 8.49 L46.14 9.78 L47.93 10.34 L47.93 7.94 Z M47.93 10.34 L46.14 9.78 L45.78 10.34 L47.03 11.26 L47.93 10.34 Z M47.03 11.26 L45.78 12.18 L46.14 12.55 L47.93 12.18 L47.03 11.26 Z M47.93 12.18 L47.93 14.58 L46.14 14.03 L46.14 12.55 L47.93 12.18 Z M47.93 14.58 L47.57 15.51 L46.14 14.03 L47.93 14.58 Z M47.57 15.51 L46.14 16.43 L45.24 14.58 L46.14 14.03 L47.57 15.51 Z M46.14 16.43 L45.24 14.58 L34.32 14.58 L34.32 16.43 L46.14 16.43 Z M34.32 10.34 L34.32 12.18 L45.78 12.18 L45.78 10.34 L34.32 10.34 Z M45.78 10.34 L45.78 12.18 L47.03 11.26 L45.78 10.34 Z M66.19 7.94 L66.19 6.09 L51.69 6.09 L52.58 7.94 L66.19 7.94 Z M52.58 7.94 L51.69 6.09 L50.25 7.01 L51.69 8.49 L52.58 7.94 Z M51.69 8.49 L50.25 7.01 L49.9 7.94 L51.69 8.49 Z M49.9 7.94 L51.69 8.49 L51.69 9.78 L49.9 10.34 L49.9 7.94 Z M49.9 10.34 L51.69 9.78 L51.69 9.78 L50.25 11.26 L49.9 10.34 Z M51.69 9.78 L50.25 11.26 L51.69 12.18 L52.58 10.34 L51.69 9.78 Z M51.69 12.18 L52.58 10.34 L64.4 10.34 L63.5 12.18 L51.69 12.18 Z M63.5 12.18 L64.4 10.34 L65.83 11.26 L64.4 12.55 L63.5 12.18 Z M65.83 11.26 L64.4 12.55 L66.19 12.18 L65.83 11.26 Z M64.4 12.55 L66.19 12.18 L66.19 14.58 L64.4 14.03 L64.4 12.55 Z M66.19 14.58 L65.83 15.51 L64.4 14.03 L66.19 14.58 Z M65.83 15.51 L64.4 14.03 L63.5 14.58 L64.4 16.43 L65.83 15.51 Z M63.5 14.58 L64.4 16.43 L49.9 16.43 L49.9 14.58 L63.5 14.58 Z';

class Pod22View {
  constructor(containerEl) {
    this.container = containerEl;
    this.isBuilt = false;

    // Peak hold memory & Hardware DIP switch defaults
    this.heldPeak = [-1, -1];
    this.holdTimer = [0, 0];
    this.dip = {
      BS0: 0, // 0 = Type 2 decay (3.0s / 24 dB - Default), 1 = Type 1 decay (1.5s / 24 dB)
      BS1: 1  // 1 = Peak Hold ON, 0 = Peak Hold OFF
    };

    // Responsive Canvas Geometry (matching XTM 3200 width)
    this.PW = 3200;
    this.PH = 192;

    // Standard Scale (-45 dB to +14 dB / PK)
    this.SCALE_STD = [
      'PR','-36','-32','-28','-26','-24','-22','-20','-18','-16',
      '-15','-14','-13','-12','-11','-10','-9','-8','-7','-6',
      '-5','-4','-3','-2','-1','0','+1','+2','+3','+4',
      '+5','+6','+7','+8','+9','+10','+11','+12','+13','+14','PK'
    ];

    this.THRESHOLDS_STD = [
      -45, -36, -32, -28, -26, -24, -22, -20, -18, -16,
      -15, -14, -13, -12, -11, -10,  -9,  -8,  -7,  -6,
       -5,  -4,  -3,  -2,  -1,   0,   1,   2,   3,   4,
        5,   6,   7,   8,   9,  10,  11,  12,  13,  14
    ];

    // Extended LED 22 Scale (Width increased, 46px spacing unchanged, adds INFINITE SILENCE on left down to -100, and DISTORTION RANGE up top on right up to +22/PK)
    this.SCALE_EXT = [
      '-100','-90','-80','-70','-60','-55','-50','-45',
      'PR','-36','-32','-28','-26','-24','-22','-20','-18','-16',
      '-15','-14','-13','-12','-11','-10','-9','-8','-7','-6',
      '-5','-4','-3','-2','-1','0','+1','+2','+3','+4',
      '+5','+6','+7','+8','+9','+10','+11','+12','+13','+14',
      '+15','+16','+17','+18','+19','+20','+21','+22','PK'
    ];

    this.THRESHOLDS_EXT = [
      -100, -90, -80, -70, -60, -55, -50, -45,
       -42, -36, -32, -28, -26, -24, -22, -20, -18, -16,
       -15, -14, -13, -12, -11, -10,  -9,  -8,  -7,  -6,
        -5,  -4,  -3,  -2,  -1,   0,   1,   2,   3,   4,
         5,   6,   7,   8,   9,  10,  11,  12,  13,  14,
        15,  16,  17,  18,  19,  20,  21,  22,  24
    ];

    this.extendedLed22 = true;

    // Scale options: 'log' (ITU-R BS.1770 / EBU R128 loudness), 'vu' (0 VU ref), 'peak' (digital peak)
    this.scaleMode = 'log';

    // DOM Element Cache
    this.ledEls = [{}, {}];
    this.glowEls = [{}, {}];
    this.lastLit = [{}, {}];
  }

  get minP() {
    return this.extendedLed22 ? -8 : 0;
  }

  get maxP() {
    return this.extendedLed22 ? 48 : 40;
  }

  get SCALE() {
    return this.extendedLed22 ? this.SCALE_EXT : this.SCALE_STD;
  }

  get DB_THRESHOLDS() {
    return this.extendedLed22 ? this.THRESHOLDS_EXT : this.THRESHOLDS_STD;
  }

  setExtendedRange(enabled) {
    if (this.extendedLed22 !== enabled) {
      this.extendedLed22 = enabled;
      this.isBuilt = false;
      this.heldPeak = [-1, -1];
      this.holdTimer = [0, 0];
      if (this.container) {
        this.container.innerHTML = this.buildShell();
        this.initDom();
        this.isBuilt = true;
      }
    }
  }

  // Tightly spaced optical LED bar with red 0 VU mark centered at screen center x = 1600
  segX(p) {
    return 1600 + (p - 25) * 46;
  }

  segColor(p) {
    if (p === this.maxP) return '#dc2626';             // PK Overload deep smoked red
    if (p >= 40) return '#ef4444';                     // DISTORTION RANGE (+15 to +22)
    if (p === 25) return '#ef4444';                    // 0 VU alignment RED
    if (p === 24 || p === 26) return '#facc15';        // -1 and +1 YELLOW
    if (p < 0) return '#10b981';                       // INFINITE SILENCE (-100 to -45)
    if (p <= 18) return '#22c55e';                     // Broadcast smoked green (-45 to -7)
    if (p <= 23) return '#f59e0b';                     // Smoked amber caution (-6 to -2)
    if (p <= 33) return '#f97316';                     // Smoked warning orange (+2 to +8)
    return '#ef4444';                                  // Deep peak red (+9 to +14)
  }

  scaleNumColor(p, lb) {
    const isPk = p === this.maxP;
    if (p === 25 || isPk) return '#ef4444'; // 0 and PK red
    if (p === 24 || p === 26) return '#facc15'; // -1 and +1 yellow
    if (p >= 40) return '#ef4444'; // Distortion range red
    if (p > 26) return '#f97316'; // +2 to +14 orange
    if (p >= 19) return '#f59e0b'; // -6 to -2 amber
    if (p < 0) return '#10b981'; // Infinite silence emerald green
    return '#94a3b8';
  }

  dbToSegmentIndex(db) {
    if (!isFinite(db) || db < (this.extendedLed22 ? -110 : -55)) return -1;
    let idx = -1;
    for (let i = 0; i < this.DB_THRESHOLDS.length; i++) {
      if (db >= this.DB_THRESHOLDS[i]) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }

  /* ---------------- Build Static Base SVG Shell Once ---------------- */
  buildShell() {
    const L = (x, y, w, h, row, p, title) => {
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

    let s = `<svg viewBox="0 0 ${this.PW} ${this.PH}" role="img" aria-label="Ward-Beck Systems POD-22 Loudness Bar" style="width:100%;display:block;border-radius:0">
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

      <!-- Seamless Dark Borderless Console Surface (Pillars removed, remaining space pure black) -->
      <rect width="${this.PW}" height="${this.PH}" fill="#08090b"/>

      <!-- ================= Borderless Meter Sections ================= -->
      <g id="pod_sections">
        <!-- Vertical Bargraphs (32w x 54h, tight 46px pitch) -->
        <!-- Row 0: Left Channel -->
        ${(() => {
          let rs = '';
          for (let p = this.minP; p <= this.maxP; p++) {
            const idx = p - this.minP;
            rs += L(this.segX(p), 38, 32, 54, 0, p, `Left ${this.SCALE[idx]}`);
          }
          return rs;
        })()}

        <!-- Center Numerical Scale Markings -->
        ${this.SCALE.map((lb, idx) => {
          const p = this.minP + idx;
          const x = this.segX(p);
          const isZero = p === 25;
          const isOne = p === 24 || p === 26; // -1 and +1
          const isPk = p === this.maxP;
          const col = this.scaleNumColor(p, lb);
          return `
            ${isZero ? `<polygon points="${x - 4.5},68 ${x + 4.5},68 ${x},76" fill="#ef4444"/>
                        <polygon points="${x - 4.5},106 ${x + 4.5},106 ${x},98" fill="#ef4444"/>` : ''}
            <text x="${x}" y="87" dominant-baseline="central" font-size="${isZero || isPk ? 13 : (isOne ? 12 : 11)}" font-weight="${isZero || isPk || isOne || p >= 40 ? '900' : '700'}"
                  fill="${col}" text-anchor="middle" font-family="ui-monospace, monospace">${lb}</text>`;
        }).join('')}

        <!-- Row 1: Right Channel -->
        ${(() => {
          let rs = '';
          for (let p = this.minP; p <= this.maxP; p++) {
            const idx = p - this.minP;
            rs += L(this.segX(p), 136, 32, 54, 1, p, `Right ${this.SCALE[idx]}`);
          }
          return rs;
        })()}

        <!-- Range Headers Below Meter Segments (Nothing On Top) -->
        ${this.extendedLed22 ? `
        <!-- Section 0: INFINITE SILENCE (Below -45 dBFS, added on left) -->
        <g class="pod-section-silence">
          <line x1="66" y1="182" x2="150" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
          <text x="243" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#10b981" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">INFINITE SILENCE</text>
          <line x1="336" y1="182" x2="420" y2="182" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 1: VU RANGE Header (PR to 0 VU) -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 2: PEAK RANGE Header (+1 to +14) -->
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1875" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1945" y="183" dominant-baseline="central" font-size="12" font-weight="900" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2015" y1="182" x2="2260" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Section 3: DISTORTION RANGE Header (+15 to PK, added on right) -->
        <g class="pod-section-distortion">
          <line x1="2276" y1="182" x2="2370" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
          <text x="2474" y="183" dominant-baseline="central" font-size="11" font-weight="900" fill="#ef4444" letter-spacing="1.2" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">DISTORTION RANGE</text>
          <line x1="2578" y1="182" x2="2674" y2="182" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        </g>
        ` : `
        <!-- Standard 2-Section VU & Peak Range -->
        <g class="pod-section-vu">
          <line x1="434" y1="182" x2="940" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1005" y="183" dominant-baseline="central" font-size="12" font-weight="900" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">VU RANGE</text>
          <line x1="1070" y1="182" x2="1576" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="pod-section-peak">
          <line x1="1624" y1="182" x2="1900" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
          <text x="1965" y="183" dominant-baseline="central" font-size="12" font-weight="900" fill="#f0f0ec" letter-spacing="1.5" text-anchor="middle" font-family="'Arial Narrow', Arial, sans-serif">PEAK RANGE</text>
          <line x1="2030" y1="182" x2="2306" y2="182" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
        </g>
        `}
      </g>
    </svg>`;

    return s;
  }

  /* ---------------- Fast Direct DOM Binding ---------------- */
  initDom() {
    this.ledEls = [{}, {}];
    this.glowEls = [{}, {}];
    this.lastLit = [{}, {}];
    for (let row = 0; row < 2; row++) {
      for (let p = this.minP; p <= this.maxP; p++) {
        this.ledEls[row][p] = this.container.querySelector(`#pod_led_${row}_${p}`);
        this.glowEls[row][p] = this.container.querySelector(`#pod_core_${row}_${p}`);
        this.lastLit[row][p] = null;
      }
    }
  }

  /* ---------------- 60 FPS Direct Fast Update ---------------- */
  render(model, levels) {
    if (!this.container) return;

    if (!this.isBuilt) {
      this.container.innerHTML = this.buildShell();
      this.initDom();
      this.isBuilt = true;
    }

    const powered = model.power;
    const hasAudio = levels.hasAudio;

    // Calculate lit segments for Row 0 (L) and Row 1 (R)
    const lit = [{}, {}];
    for (let p = this.minP; p <= this.maxP; p++) {
      lit[0][p] = false;
      lit[1][p] = false;
    }

    if (powered && hasAudio) {
      for (let ch = 0; ch < 2; ch++) {
        // True Perceived Loudness (LUFS / RMS aligned to -24 LUFS broadcast nominal 0) or VU
        let loudDb = levels.vuDb[ch];
        if (this.scaleMode === 'log') {
          if (levels.lufs && levels.lufs.mL !== undefined) {
            const lufsCh = ch === 0 ? levels.lufs.mL : levels.lufs.mR;
            if (isFinite(lufsCh) && lufsCh > -59) {
              loudDb = lufsCh + 24;
            }
          }
        } else if (this.scaleMode === 'vu') {
          loudDb = levels.vuDb[ch];
        } else if (this.scaleMode === 'peak') {
          loudDb = levels.ppmDb[ch];
        }

        const vuIdx = this.dbToSegmentIndex(loudDb);
        const maxIdx = this.SCALE.length - 1;

        for (let i = 0; i <= vuIdx && i < maxIdx; i++) {
          const p = this.minP + i;
          lit[ch][p] = true;
        }

        // Peak Hold Dot
        const ppmDb = levels.ppmDb[ch];
        const pkIdx = this.dbToSegmentIndex(ppmDb);

        if (pkIdx >= this.heldPeak[ch]) {
          this.heldPeak[ch] = pkIdx;
          this.holdTimer[ch] = 90;
        } else {
          if (this.holdTimer[ch] > 0) {
            this.holdTimer[ch]--;
          } else {
            this.heldPeak[ch] = Math.max(-1, this.heldPeak[ch] - 1);
          }
        }

        if (this.heldPeak[ch] >= 0 && this.heldPeak[ch] <= maxIdx) {
          const holdP = this.minP + this.heldPeak[ch];
          lit[ch][holdP] = true;
        }

        // Peak Clip (overload / distortion limit indicator)
        const clipThreshold = this.extendedLed22 ? 22 : 14;
        if (levels.peak[ch] || levels.ppmDb[ch] >= clipThreshold) {
          lit[ch][this.maxP] = true;
        }
      }
    } else {
      this.heldPeak = [-1, -1];
      this.holdTimer = [0, 0];
    }

    // Direct DOM property mutation only on changed segments (Zero teardown)
    for (let row = 0; row < 2; row++) {
      for (let p = this.minP; p <= this.maxP; p++) {
        const isLit = lit[row][p];
        if (this.lastLit[row][p] !== isLit) {
          this.lastLit[row][p] = isLit;
          const led = this.ledEls[row][p];
          const core = this.glowEls[row][p];
          if (!led) continue;

          if (isLit) {
            led.setAttribute('fill', this.segColor(p));
            led.setAttribute('opacity', '0.88');
            led.setAttribute('filter', 'url(#smokyglow)');
            if (core) core.setAttribute('opacity', '0.24');
          } else {
            led.setAttribute('fill', '#111317');
            led.setAttribute('opacity', '0.15');
            led.removeAttribute('filter');
            if (core) core.setAttribute('opacity', '0');
          }
        }
      }
    }
  }
}

window.Pod22View = Pod22View;
