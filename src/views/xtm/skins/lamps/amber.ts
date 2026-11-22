/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Amber VU dial lamp (default; also the fallback for unknown dialLamp values). */
import type { LampVariant } from './lamp-types';

export const AMBER_LAMP: LampVariant = {
  id: 'amber',
  gradientId: 'xamber',
  bloom: true,
  bloomPos: 'top',
  gradient: `<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`
};

/** Amber VU dial lamp cast from below the bezel rim (uniform dual-lamp bottom illumination) */
export const AMBER_BOTTOM_LAMP: LampVariant = {
  id: 'amber_bottom',
  gradientId: 'xamber_bottom',
  bloom: true,
  bloomPos: 'bottom',
  gradient: `<linearGradient id="xamber_bottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="16%" stop-color="#fed876"/>
          <stop offset="45%" stop-color="#fbb024"/>
          <stop offset="75%" stop-color="#ea8a10"/>
          <stop offset="100%" stop-color="#cf720a"/>
        </linearGradient>`
};
