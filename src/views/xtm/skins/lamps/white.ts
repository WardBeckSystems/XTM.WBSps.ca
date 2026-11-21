/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/** White VU dial lamp (cool, no incandescent bloom). */
import type { LampVariant } from './lamp-types';

export const WHITE_LAMP: LampVariant = {
  id: 'white',
  gradientId: 'xwhite',
  bloom: false,
  gradient: `<radialGradient id="xwhite" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#f8fafc"/>
          <stop offset="65%" stop-color="#e2e8f0"/>
          <stop offset="90%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>`
};

/** Warm studio white halogen lamp (3200K) */
export const WARM_WHITE_LAMP: LampVariant = {
  id: 'warm_white',
  gradientId: 'xwarm_white',
  bloom: true,
  bloomPos: 'top',
  gradient: `<radialGradient id="xwarm_white" cx="50%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fffdf7"/>
          <stop offset="55%" stop-color="#f8f4e6"/>
          <stop offset="80%" stop-color="#e2dac5"/>
          <stop offset="100%" stop-color="#b0a48a"/>
        </radialGradient>`
};
