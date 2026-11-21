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

/** Amber VU dial lamp cast from below the bezel rim */
export const AMBER_BOTTOM_LAMP: LampVariant = {
  id: 'amber_bottom',
  gradientId: 'xamber_bottom',
  bloom: true,
  bloomPos: 'bottom',
  gradient: `<radialGradient id="xamber_bottom" cx="50%" cy="96%" r="88%">
          <stop offset="0%" stop-color="#fff8db"/>
          <stop offset="15%" stop-color="#fed766"/>
          <stop offset="38%" stop-color="#fbb024"/>
          <stop offset="65%" stop-color="#ea7a08"/>
          <stop offset="88%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#541c08"/>
        </radialGradient>`
};
