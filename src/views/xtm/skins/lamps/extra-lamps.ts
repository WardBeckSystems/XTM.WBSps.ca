/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Extra VU dial lamps and dial background gradients. */
import type { LampVariant } from './lamp-types';

export const GREEN_GLOW_LAMP: LampVariant = {
  id: 'green_glow',
  gradientId: 'xgreen_glow',
  bloom: true,
  bloomPos: 'top',
  gradient: `<radialGradient id="xgreen_glow" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f0fdf4"/>
          <stop offset="20%" stop-color="#bbf7d0"/>
          <stop offset="48%" stop-color="#4ade80"/>
          <stop offset="75%" stop-color="#16a34a"/>
          <stop offset="92%" stop-color="#14532d"/>
          <stop offset="100%" stop-color="#052e16"/>
        </radialGradient>`
};

export const DARK_NIGHT_LAMP: LampVariant = {
  id: 'dark_night',
  gradientId: 'xdark_night',
  bloom: false,
  gradient: `<radialGradient id="xdark_night" cx="50%" cy="38%" r="72%">
          <stop offset="0%" stop-color="#262c36"/>
          <stop offset="35%" stop-color="#181c22"/>
          <stop offset="75%" stop-color="#0e1014"/>
          <stop offset="100%" stop-color="#050608"/>
        </radialGradient>`
};

export const UNLIT_LAMP: LampVariant = {
  id: 'unlit',
  gradientId: 'xunlit',
  bloom: false,
  gradient: `<radialGradient id="xunlit" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#f6f3ea"/>
          <stop offset="40%" stop-color="#ede7d8"/>
          <stop offset="75%" stop-color="#dfd6c0"/>
          <stop offset="100%" stop-color="#c8bda3"/>
        </radialGradient>`
};

/** Bottom-rim incandescent filament bloom gradient */
export const INCAND_BLOOM_BOTTOM_GRADIENT = `<radialGradient id="xincand_bloom_bottom" cx="50%" cy="98%" r="85%">
          <stop offset="0%" stop-color="#fff8db" stop-opacity="0.68"/>
          <stop offset="28%" stop-color="#fed766" stop-opacity="0.42"/>
          <stop offset="65%" stop-color="#f59e0b" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
        </radialGradient>`;

/** Dial face plate background gradients (Buff, Champagne, Slate) */
export const DIAL_BG_GRADIENTS = `
  <radialGradient id="xdial_buff" cx="50%" cy="42%" r="65%">
    <stop offset="0%" stop-color="#fff8e7"/>
    <stop offset="35%" stop-color="#f8edd3"/>
    <stop offset="70%" stop-color="#ede0c0"/>
    <stop offset="100%" stop-color="#d4c39e"/>
  </radialGradient>
  <radialGradient id="xdial_champagne" cx="50%" cy="38%" r="70%">
    <stop offset="0%" stop-color="#fbf8f0"/>
    <stop offset="30%" stop-color="#ede6d2"/>
    <stop offset="65%" stop-color="#d8cdb0"/>
    <stop offset="100%" stop-color="#b5a786"/>
  </radialGradient>
  <radialGradient id="xdial_slate" cx="50%" cy="38%" r="70%">
    <stop offset="0%" stop-color="#808d9e"/>
    <stop offset="35%" stop-color="#5d6978"/>
    <stop offset="75%" stop-color="#3d4754"/>
    <stop offset="100%" stop-color="#232a33"/>
  </radialGradient>
`;
