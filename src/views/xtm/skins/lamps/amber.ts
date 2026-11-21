/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Amber VU dial lamp (default; also the fallback for unknown dialLamp values). */
import type { LampVariant } from './lamp-types';

export const AMBER_LAMP: LampVariant = {
  id: 'amber',
  gradientId: 'xamber',
  bloom: true,
  gradient: `<radialGradient id="xamber" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="18%" stop-color="#ffdf7a"/>
          <stop offset="42%" stop-color="#fbb024"/>
          <stop offset="68%" stop-color="#ea7a08"/>
          <stop offset="90%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#692802"/>
        </radialGradient>`
};
