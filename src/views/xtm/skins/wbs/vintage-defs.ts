/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * SVG defs for Ward-Beck vintage hardware styling (Ward-Beck.ca):
 * - Slate-blue baked enamel front panel gradient & top rim gradient.
 * - 3D molded Bakelite / ABS meter bezel gradients.
 * - Bezel inner recessed step bevel gradient.
 * - Window top overhang shadow gradient.
 * - Mechanical trimmer screw head gradient & 4-corner chassis screw gradient.
 * - Skirted Bakelite flange, fluted barrel, and glossy cap gradients.
 * - Chrome pilot lamp bezel and jeweled lens gradients.
 * - Soft drop shadow filters for meter housings, knob, and pilot lamp.
 */

export const WBS_VINTAGE_DEFS = `
  <!-- McCurdy / WBS Radio Slate-Blue Baked Enamel Faceplate (#436478 to #2c4454) -->
  <linearGradient id="wbsSlateBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#436478" />
    <stop offset="48%" stop-color="#375466" />
    <stop offset="100%" stop-color="#2c4454" />
  </linearGradient>

  <!-- Top Perforated Ventilation Rim -->
  <linearGradient id="topRimSlateBlue" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#51768c" />
    <stop offset="75%" stop-color="#3b596b" />
    <stop offset="100%" stop-color="#243846" />
  </linearGradient>

  <!-- Enamel / Painted Off-White Front Panel -->
  <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#e5e3dc" />
    <stop offset="50%" stop-color="#dedcd4" />
    <stop offset="100%" stop-color="#d2d0c7" />
  </linearGradient>

  <!-- Brushed / Anodized Top Chassis Lip -->
  <linearGradient id="topChassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#7d8084" />
    <stop offset="70%" stop-color="#9ca0a4" />
    <stop offset="100%" stop-color="#b5b8bc" />
  </linearGradient>

  <!-- Black Skirted Bakelite Knob Flange -->
  <radialGradient id="skirtGrad" cx="42%" cy="38%" r="58%">
    <stop offset="0%" stop-color="#2b2d30" />
    <stop offset="65%" stop-color="#161719" />
    <stop offset="100%" stop-color="#0b0c0d" />
  </radialGradient>

  <!-- Fluted Knob Barrel Body -->
  <linearGradient id="knobBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#35383c" />
    <stop offset="40%" stop-color="#191a1c" />
    <stop offset="85%" stop-color="#0d0e0f" />
    <stop offset="100%" stop-color="#222426" />
  </linearGradient>

  <!-- Glossy Knob Face Cap -->
  <radialGradient id="knobCapGrad" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#3a3d42" />
    <stop offset="38%" stop-color="#1a1b1d" />
    <stop offset="100%" stop-color="#0d0e10" />
  </radialGradient>

  <!-- Chrome Pilot Lamp Bezel -->
  <radialGradient id="chromeBezelGrad" cx="35%" cy="30%" r="68%">
    <stop offset="0%" stop-color="#ffffff" />
    <stop offset="28%" stop-color="#b8bec6" />
    <stop offset="55%" stop-color="#5a6068" />
    <stop offset="80%" stop-color="#d4dae2" />
    <stop offset="100%" stop-color="#383c42" />
  </radialGradient>

  <!-- Clear Jewelled Pilot Lens (Off) -->
  <radialGradient id="lensGrad" cx="42%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
    <stop offset="45%" stop-color="#d8dde4" stop-opacity="0.78" />
    <stop offset="78%" stop-color="#8b929c" stop-opacity="0.85" />
    <stop offset="100%" stop-color="#eef2f6" stop-opacity="0.92" />
  </radialGradient>

  <!-- Warm Incandescent Jewelled Pilot Lens (On) -->
  <radialGradient id="lensOnGrad" cx="42%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.98" />
    <stop offset="35%" stop-color="#fde68a" stop-opacity="0.92" />
    <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.88" />
    <stop offset="100%" stop-color="#d97706" stop-opacity="0.95" />
  </radialGradient>

  <!-- Soft Directional Sunlight Drop Shadows -->
  <filter id="knobDropShadow" x="-30%" y="-20%" width="160%" height="160%">
    <feDropShadow dx="-12" dy="14" stdDeviation="6" flood-color="#1b1c1e" flood-opacity="0.34" />
  </filter>

  <filter id="lampDropShadow" x="-40%" y="-30%" width="180%" height="180%">
    <feDropShadow dx="-7" dy="8" stdDeviation="3.5" flood-color="#1b1c1e" flood-opacity="0.32" />
  </filter>
`;
