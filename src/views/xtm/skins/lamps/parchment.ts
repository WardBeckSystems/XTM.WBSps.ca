/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** Parchment VU dial lamp. */
import type { LampVariant } from './lamp-types';

export const PARCHMENT_LAMP: LampVariant = {
  id: 'parchment',
  gradientId: 'xparchment',
  bloom: true,
  gradient: `<radialGradient id="xparchment" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#fffdf5"/>
          <stop offset="22%" stop-color="#fef3d6"/>
          <stop offset="55%" stop-color="#f5e1ad"/>
          <stop offset="85%" stop-color="#d6b372"/>
          <stop offset="100%" stop-color="#8f692d"/>
        </radialGradient>`
};
