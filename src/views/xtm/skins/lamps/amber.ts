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
  gradient: `<radialGradient id="xamber_bottom" cx="50%" cy="65%" r="75%">
          <stop offset="0%" stop-color="#ffeaa0"/>
          <stop offset="35%" stop-color="#fed876"/>
          <stop offset="68%" stop-color="#f5ad2b"/>
          <stop offset="90%" stop-color="#e28c12"/>
          <stop offset="100%" stop-color="#cc7408"/>
        </radialGradient>`
};
