/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Amber VU dial lamp (default; also the fallback for unknown dialLamp values). */
import type { LampVariant } from './lamp-types';

export const AMBER_LAMP: LampVariant = {
  id: 'amber',
  gradientId: 'xamber',
  bloom: true,
  gradient: `<radialGradient id="xamber" cx="50%" cy="96%" r="88%">
          <stop offset="0%" stop-color="#fff8db"/>
          <stop offset="15%" stop-color="#fed766"/>
          <stop offset="38%" stop-color="#fbb024"/>
          <stop offset="65%" stop-color="#ea7a08"/>
          <stop offset="88%" stop-color="#b85104"/>
          <stop offset="100%" stop-color="#541c08"/>
        </radialGradient>`
};
